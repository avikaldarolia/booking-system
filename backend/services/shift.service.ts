import { WeeklyEmployeeStats } from "./../entities/WeeklyEmployeeStats";
import { AppDataSource } from "../data-source";
import { Shift } from "../entities/Shift";
import { Employee } from "../entities/Employee";
import { Store } from "../entities/Store";
import { Availability } from "../entities/Availability";
import { Between } from "typeorm";
import { startOfWeek, endOfWeek, format } from "date-fns";
import { syncShiftWithGoogleCalendar } from "../third-party/google-calendar/googleCalender";
import * as utils from "../utils/utils";
import { Week } from "../entities/Week";

const shiftRepository = AppDataSource.getRepository(Shift);
const employeeRepository = AppDataSource.getRepository(Employee);
const storeRepository = AppDataSource.getRepository(Store);
const availabilityRepository = AppDataSource.getRepository(Availability);
const weeklyStatsRepository = AppDataSource.getRepository(WeeklyEmployeeStats);
const weekRepository = AppDataSource.getRepository(Week);

/**
 * Get all shifts
 * @param storeId
 * @param startDate
 * @param endDate
 * @param employeeId
 * @returns
 */
export const GetAllShifts = async (storeId?: string, startDate?: string, endDate?: string, employeeId?: string) => {
	try {
		let query = shiftRepository
			.createQueryBuilder("shift")
			.leftJoinAndSelect("shift.employee", "employee")
			.leftJoinAndSelect("shift.store", "store");

		if (storeId) {
			query = query.andWhere("store.id = :storeId", { storeId });
		}

		if (employeeId) {
			query = query.andWhere("employee.id = :employeeId", { employeeId });
		}

		if (startDate && endDate) {
			const start = utils.localeDate(startDate);
			const end = utils.localeDate(endDate);
			query = query.andWhere("shift.date BETWEEN :start AND :end", {
				start,
				end,
			});
		}

		const result = utils.parseSafe(await query.getMany());
		return utils.serviceResponse(true, result, "");
	} catch (error) {
		throw error;
	}
};

/**
 * Gets shift by id
 * @param id
 * @returns
 */
export const GetShiftById = async (id: string) => {
	try {
		const shift = await shiftRepository.findOne({
			where: { id },
			relations: ["employee", "store"],
		});

		if (!shift) {
			throw new Error("Shift not found");
		}

		return utils.serviceResponse(true, shift, "");
	} catch (error) {
		throw error;
	}
};

/**
 * Creates a shift
 * @param data
 * @returns
 */
export const createShift = async (data: {
	employeeId: string;
	storeId: string;
	date: string;
	startTime: string;
	endTime: string;
	note?: string;
	isPublished?: boolean;
}) => {
	return utils.runInTransaction<Shift>(async (queryRunner) => {
		const { employeeId, storeId, date, startTime, endTime, note, isPublished } = data;
		const normalizedStartTime = utils.normalizeTime(startTime);
		const normalizedEndTime = utils.normalizeTime(endTime);

		const adjustedDate = utils.localeDate(date);

		const weekStart = format(startOfWeek(adjustedDate), "yyyy-MM-dd");
		const weekEnd = format(endOfWeek(adjustedDate), "yyyy-MM-dd");

		// Fetch Store
		const store: Store = await queryRunner.manager.getRepository(Store).findOne({ where: { id: storeId } });
		if (!store) throw new Error("Store not found");

		// Check if shift times are within store hours
		if (normalizedStartTime < store.openTime || normalizedEndTime > store.closeTime) {
			throw new Error("Shift times must be within store operating hours");
		}

		// Fetch employee
		const employee: Employee = await queryRunner.manager.getRepository(Employee).findOne({ where: { id: employeeId } });
		if (!employee) throw new Error(`Employee with id ${employeeId} not found`);

		const existingShift: Shift = await queryRunner.manager.getRepository(Shift).find({
			where: {
				employee: { id: employeeId },
				date: adjustedDate,
				store: { id: storeId },
			},
		});

		if (existingShift) {
			throw new Error("Employee is already scheduled for this day.");
		}
		// Check if employee is available
		const availability = await queryRunner.manager.getRepository(Availability).findOne({
			where: { employee: { id: employeeId }, date, isBlocked: true },
		});

		if (availability) throw new Error("Employee has blocked this date for availability");

		// Find or Create the week for this date.
		let week: Week = await queryRunner.manager.getRepository(Week).findOne({
			where: {
				startDate: weekStart,
				endDate: weekEnd,
				store: { id: storeId },
			},
		});

		if (!week) {
			week = queryRunner.manager.getRepository(Week).create({
				startDate: weekStart,
				endDate: weekEnd,
				store,
				budget: store.weeklyBudget, // Store's current weekly budget.
				cost: 0, // Current cost is zero.
			});

			await queryRunner.manager.getRepository(Week).save(week);
		}

		// Find or create weekStats for this week_id and emp_id and storeId.
		let weeklyEmployeeStats: WeeklyEmployeeStats = await queryRunner.manager
			.getRepository(WeeklyEmployeeStats)
			.findOne({
				where: {
					employee: { id: employeeId },
					week: { id: week.id },
					store: { id: storeId },
				},
			});

		if (!weeklyEmployeeStats) {
			weeklyEmployeeStats = queryRunner.manager.getRepository(WeeklyEmployeeStats).create({
				employee,
				week,
				store,
				empHourlyRate: employee.hourlyRate,
				empHours: 0,
				empTotalCost: 0,
				empMaxHours: employee.maxHours,
			});
			await queryRunner.manager.getRepository(WeeklyEmployeeStats).save(weeklyEmployeeStats);
		}

		const hours = utils.calculateShiftHours(startTime, endTime);
		const cost = utils.calculateShiftCost(hours, employee.hourlyRate);

		// If shift exceeds max hours
		if (Number(weeklyEmployeeStats.empHours) + Number(hours) > Number(employee.maxHours)) {
			throw new Error("This shift would exceed employee's maximum hours");
		}

		// If shift exceeds budget
		if (Number(week.cost) + cost > Number(week.budget)) {
			throw new Error("This shift would exceed the weekly budget");
		}

		// Create and save the shift
		const newShift = queryRunner.manager.getRepository(Shift).create({
			employee,
			week,
			store,
			date: adjustedDate,
			startTime,
			endTime,
			hours,
			cost,
			note,
		});

		await queryRunner.manager.getRepository(Shift).save(newShift);

		week.cost = Number(week.cost) + cost;
		weeklyEmployeeStats.empHours = Number(weeklyEmployeeStats.empHours) + hours;
		weeklyEmployeeStats.empTotalCost = Number(weeklyEmployeeStats.empTotalCost) + cost;

		await queryRunner.manager.getRepository(Week).save(week);
		await queryRunner.manager.getRepository(WeeklyEmployeeStats).save(weeklyEmployeeStats);

		return newShift;
	});
};

/**
 * Deletes the shift
 * @param id
 * @returns
 */
export const deleteShift = async (id: string) => {
	return utils.runInTransaction<Shift>(async (queryRunner) => {
		const shift: Shift = utils.parseSafe(
			await shiftRepository.findOne({
				where: { id },
				relations: ["employee", "week"],
			})
		);
		if (!shift) throw new Error("Shift not found");

		let week = shift.week;

		let weeklyEmployeeStats: WeeklyEmployeeStats = utils.parseSafe(
			await weeklyStatsRepository.findOne({
				where: {
					week: { id: shift.week?.id },
					employee: { id: shift.employee?.id },
				},
			})
		);

		// Remove emp hours and cost from weekly-emp-stats
		weeklyEmployeeStats.empHours = Number(weeklyEmployeeStats.empHours) - Number(shift.hours);
		weeklyEmployeeStats.empTotalCost = Number(weeklyEmployeeStats.empTotalCost) - Number(shift.cost);

		// Remove emp cost from weekly-stats
		week.cost = Number(week.cost) - Number(shift.cost);

		await weeklyStatsRepository.save(weeklyEmployeeStats);
		await weekRepository.save(week);

		await shiftRepository.remove(shift);
		return shift;
	});
};

/**
 * Get weekly shifts by date or weekId.
 * @param storeId
 * @param date
 * @param weekId
 * @returns
 */
export const GetWeeklyShifts = async (storeId: string, date: string, weekId?: string | undefined) => {
	try {
		if (!storeId) {
			throw new Error("Store Id is required");
		}

		const targetDate = new Date(date);
		if (isNaN(targetDate.getTime())) {
			throw new Error("Invalid date format");
		}

		let shifts;
		if (weekId && weekId.trim().length > 0 && weekId !== "undefined") {
			shifts = utils.parseSafe(
				await shiftRepository.find({
					where: {
						store: { id: storeId },
						week: { id: weekId },
					},
					relations: ["employee"],
				})
			);
		} else {
			const targetDate = new Date(date);
			const weekStart = startOfWeek(targetDate);
			const weekEnd = endOfWeek(targetDate);

			shifts = utils.parseSafe(
				await shiftRepository.find({
					where: {
						store: { id: storeId },
						date: Between(weekStart, weekEnd),
					},
					relations: ["employee"],
				})
			);
		}

		return utils.serviceResponse(true, shifts, "");
	} catch (error) {
		throw error;
	}
};

export const updateShift = async (
	id: string,
	data: {
		employeeId?: string;
		date?: string;
		startTime?: string;
		endTime?: string;
		note?: string;
		isPublished?: boolean;
	}
) => {
	try {
		const shift = await shiftRepository.findOne({
			where: { id },
			relations: ["employee", "store"],
		});

		if (!shift) throw new Error("Shift not found");

		const originalHours = shift.hours;
		const originalCost = shift.cost;
		const originalEmployeeId = shift.employee.id;

		let employee: Employee | null = shift.employee;

		if (data.employeeId && data.employeeId !== originalEmployeeId) {
			employee = await employeeRepository.findOne({ where: { id: data.employeeId } });
			if (!employee) throw new Error("Employee not found");
		}

		const startHour = parseInt((data.startTime || shift.startTime).split(":")[0]);
		const endHour = parseInt((data.endTime || shift.endTime).split(":")[0]);
		const hours = endHour - startHour;
		const cost = hours * employee.hourlyRate;

		const hoursDiff = hours - originalHours;
		if (data.employeeId === originalEmployeeId && employee.currentHours + hoursDiff > employee.maxHours) {
			throw new Error("This shift would exceed employee's maximum hours");
		}

		const shiftDate = data.date ? new Date(data.date) : new Date(shift.date);
		const weekStart = startOfWeek(shiftDate);
		const weekEnd = endOfWeek(shiftDate);

		const weeklyEmployeeStats = await weeklyStatsRepository.findOne({
			where: {
				store: { id: shift.store.id },
				weekStartDate: Between(weekStart, weekEnd),
			},
		});

		if (!weeklyEmployeeStats) throw new Error("Weekly stats not found");

		const costDiff = cost - originalCost;
		if (weeklyEmployeeStats.totalCost + costDiff > weeklyEmployeeStats.budgetAllocated) {
			throw new Error("This shift would exceed the weekly budget");
		}

		shiftRepository.merge(shift, {
			employee,
			date: shiftDate,
			startTime: data.startTime || shift.startTime,
			endTime: data.endTime || shift.endTime,
			hours,
			cost,
			note: data.note !== undefined ? data.note : shift.note,
			isPublished: data.isPublished !== undefined ? data.isPublished : shift.isPublished,
		});

		if (data.isPublished && !shift.googleCalendarEventId) {
			try {
				const eventId = await syncShiftWithGoogleCalendar(shift);
				if (eventId) shift.googleCalendarEventId = eventId;
			} catch (error) {
				console.error("Google Calendar sync failed:", error);
			}
		}

		const updatedShift = await shiftRepository.save(shift);

		if (data.employeeId && data.employeeId !== originalEmployeeId) {
			const originalEmployee = await employeeRepository.findOne({
				where: { id: originalEmployeeId },
			});
			if (originalEmployee) {
				originalEmployee.currentHours -= originalHours;
				await employeeRepository.save(originalEmployee);
			}
			employee.currentHours += hours;
			await employeeRepository.save(employee);
		} else {
			employee.currentHours = employee.currentHours - originalHours + hours;
			await employeeRepository.save(employee);
		}

		weeklyEmployeeStats.totalHours = weeklyEmployeeStats.totalHours - originalHours + hours;
		weeklyEmployeeStats.totalCost = weeklyEmployeeStats.totalCost - originalCost + cost;
		weeklyEmployeeStats.budgetRemaining = weeklyEmployeeStats.budgetRemaining + originalCost - cost;
		await weeklyStatsRepository.save(weeklyEmployeeStats);

		return updatedShift;
	} catch (error) {
		throw new Error(`Failed to update shift: ${error instanceof Error && error.message}`);
	}
};

// export const publishShift = async (id: string) => {
// 	try {
// 		const shift = await shiftRepository.findOne({
// 			where: { id },
// 			relations: ["employee", "store"],
// 		});

// 		if (!shift) throw new Error("Shift not found");

// 		shift.isPublished = true;

// 		try {
// 			const eventId = await syncShiftWithGoogleCalendar(shift);
// 			if (eventId) shift.googleCalendarEventId = eventId;
// 		} catch (error) {
// 			console.error("Google Calendar sync failed:", error);
// 		}

// 		return await shiftRepository.save(shift);
// 	} catch (error) {
// 		throw new Error(`Failed to publish shift: ${error instanceof Error && error.message}`);
// 	}
// };
