import { WeeklyStats } from "./../entities/WeeklyStats";
import { AppDataSource } from "../data-source";
import { Shift } from "../entities/Shift";
import { Employee } from "../entities/Employee";
import { Store } from "../entities/Store";
import { Availability } from "../entities/Availability";
import { WeeklyStats } from "../entities/WeeklyStats";
import { Between } from "typeorm";
import { startOfWeek, endOfWeek, format, startOfDay, parseISO, endOfDay, addMinutes } from "date-fns";
import { syncShiftWithGoogleCalendar } from "../third-party/google-calendar/googleCalender";
import * as utils from "../utils/utils";
import { Week } from "../entities/Week";

const shiftRepository = AppDataSource.getRepository(Shift);
const employeeRepository = AppDataSource.getRepository(Employee);
const storeRepository = AppDataSource.getRepository(Store);
const availabilityRepository = AppDataSource.getRepository(Availability);
const weeklyStatsRepository = AppDataSource.getRepository(WeeklyStats);

export const getAllShifts = async (storeId?: string, startDate?: string, endDate?: string, employeeId?: string) => {
	try {
		// const start = startDate ? new Date(`${startDate}T00:00:00`) : new Date().toISOString(); // Local midnight
		// const end = endDate ? new Date(`${endDate}T23:59:59.999`) : new Date().toISOString();
		const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
		const end = endDate ? new Date(`${endDate}T23:59:59.999`) : null;

		// const utcStart = start.toISOString();
		// const utcEnd = end.toISOString();

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

		if (start && end) {
			query = query.andWhere("shift.date BETWEEN :start AND :end", {
				start,
				end,
			});
		}

		return await query.getMany();
	} catch (error) {
		console.log("error", error);

		throw new Error(`Failed to fetch shifts: ${error instanceof Error && error.message}`);
	}
};

export const getShiftById = async (id: string) => {
	try {
		const shift = await shiftRepository.findOne({
			where: { id },
			relations: ["employee", "store"],
		});

		if (!shift) {
			throw new Error("Shift not found");
		}

		return shift;
	} catch (error) {
		throw new Error(`Failed to fetch shift: ${error instanceof Error && error.message}`);
	}
};

export const createShift = async (data: {
	employeeId: string;
	storeId: string;
	date: string;
	startTime: string;
	endTime: string;
	note?: string;
	isPublished?: boolean;
}) => {
	return utils.runInTransaction(async (queryRunner) => {
		const { employeeId, storeId, date, startTime, endTime, note, isPublished } = data;
		const normalizedStartTime = utils.normalizeTime(startTime);
		const normalizedEndTime = utils.normalizeTime(endTime);

		const dateISO = parseISO(date);
		const adjustedDate = addMinutes(dateISO, dateISO.getTimezoneOffset());

		const weekStart = format(startOfWeek(adjustedDate), "yyyy-MM-dd");
		const weekEnd = format(endOfWeek(adjustedDate), "yyyy-MM-dd");

		console.log("week start", weekStart);
		console.log("week end", weekEnd);

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

		console.log("Week", week);

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
		let weeklyStats: WeeklyStats = await queryRunner.manager.getRepository(WeeklyStats).findOne({
			where: {
				employee: { id: employeeId },
				week: { id: week.id },
				store: { id: storeId },
			},
		});

		if (!weeklyStats) {
			weeklyStats = queryRunner.manager.getRepository(WeeklyStats).create({
				employee,
				week,
				store,
				empHourlyRate: employee.hourlyRate,
				empHours: 0,
				empTotalCost: 0,
				empMaxHours: employee.maxHours,
			});
			await queryRunner.manager.getRepository(WeeklyStats).save(weeklyStats);
		}

		const hours = utils.calculateShiftHours(startTime, endTime);
		const cost = utils.calculateShiftCost(hours, employee.hourlyRate);

		// If shift exceeds max hours
		if (Number(weeklyStats.empHours) + Number(hours) > Number(employee.maxHours)) {
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
		weeklyStats.empHours = Number(weeklyStats.empHours) + hours;
		weeklyStats.empTotalCost = Number(weeklyStats.empTotalCost) + cost;

		await queryRunner.manager.getRepository(Week).save(week);
		await queryRunner.manager.getRepository(WeeklyStats).save(weeklyStats);

		return newShift;
	});
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

		const weeklyStats = await weeklyStatsRepository.findOne({
			where: {
				store: { id: shift.store.id },
				weekStartDate: Between(weekStart, weekEnd),
			},
		});

		if (!weeklyStats) throw new Error("Weekly stats not found");

		const costDiff = cost - originalCost;
		if (weeklyStats.totalCost + costDiff > weeklyStats.budgetAllocated) {
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

		weeklyStats.totalHours = weeklyStats.totalHours - originalHours + hours;
		weeklyStats.totalCost = weeklyStats.totalCost - originalCost + cost;
		weeklyStats.budgetRemaining = weeklyStats.budgetRemaining + originalCost - cost;
		await weeklyStatsRepository.save(weeklyStats);

		return updatedShift;
	} catch (error) {
		throw new Error(`Failed to update shift: ${error instanceof Error && error.message}`);
	}
};

export const deleteShift = async (id: string) => {
	return runInTransaction(async (queryRunner) => {
		const shift = await shiftRepository.findOne({
			where: { id },
			relations: ["employee", "store"],
		});

		if (!shift) throw new Error("Shift not found");
		const weekStart = startOfWeek(new Date(shift.date));
		const weekEnd = endOfWeek(new Date(shift.date));

		const weeklyStats = await weeklyStatsRepository.findOne({
			where: {
				store: { id: shift.store.id },
				weekStartDate: Between(weekStart, weekEnd),
			},
		});

		const employee = shift.employee;
		employee.currentHours -= shift.hours;
		await employeeRepository.save(employee);

		if (weeklyStats) {
			weeklyStats.totalHours = Number(weeklyStats.totalHours) - Number(shift.hours);
			weeklyStats.totalCost = Number(weeklyStats.totalCost) - Number(shift.cost);
			weeklyStats.budgetRemaining = Number(weeklyStats.budgetRemaining) + Number(shift.cost);
			await weeklyStatsRepository.save(weeklyStats);
		}

		await shiftRepository.remove(shift);
		return { message: "Shift deleted successfully" };
	});
};

export const publishShift = async (id: string) => {
	try {
		const shift = await shiftRepository.findOne({
			where: { id },
			relations: ["employee", "store"],
		});

		if (!shift) throw new Error("Shift not found");

		shift.isPublished = true;

		try {
			const eventId = await syncShiftWithGoogleCalendar(shift);
			if (eventId) shift.googleCalendarEventId = eventId;
		} catch (error) {
			console.error("Google Calendar sync failed:", error);
		}

		return await shiftRepository.save(shift);
	} catch (error) {
		throw new Error(`Failed to publish shift: ${error instanceof Error && error.message}`);
	}
};

export const getWeeklyShifts = async (storeId: string, date: string) => {
	try {
		if (!storeId || !date) {
			throw new Error("Store ID and date are required");
		}

		const targetDate = new Date(date);
		const weekStart = startOfWeek(targetDate);
		const weekEnd = endOfWeek(targetDate);

		return await shiftRepository.find({
			where: {
				store: { id: storeId },
				date: Between(weekStart, weekEnd),
			},
			relations: ["employee"],
		});
	} catch (error) {
		throw new Error(`Failed to fetch weekly shifts: ${error instanceof Error && error.message}`);
	}
};
