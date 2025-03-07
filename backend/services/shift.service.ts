import { AppDataSource } from "../data-source";
import { Shift } from "../entities/Shift";
import { Employee } from "../entities/Employee";
import { Store } from "../entities/Store";
import { Availability } from "../entities/Availability";
import { WeeklyStats } from "../entities/WeeklyStats";
import { Between } from "typeorm";
import { startOfWeek, endOfWeek, format, startOfDay } from "date-fns";
import { syncShiftWithGoogleCalendar } from "../third-party/google-calendar/googleCalender";

const shiftRepository = AppDataSource.getRepository(Shift);
const employeeRepository = AppDataSource.getRepository(Employee);
const storeRepository = AppDataSource.getRepository(Store);
const availabilityRepository = AppDataSource.getRepository(Availability);
const weeklyStatsRepository = AppDataSource.getRepository(WeeklyStats);

export const getAllShifts = async (storeId?: string, startDate?: string, endDate?: string, employeeId?: string) => {
	try {
		const start = new Date(`${startDate}T00:00:00`); // Local midnight
		const end = new Date(`${endDate}T23:59:59.999`);

		const utcStart = start.toISOString();
		const utcEnd = end.toISOString();

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

		if (utcStart && utcEnd) {
			query = query.andWhere("shift.date BETWEEN :utcStart AND :utcEnd", {
				utcStart,
				utcEnd,
			});
		}

		return await query.getMany();
	} catch (error) {
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
	try {
		const { employeeId, storeId, date, startTime, endTime, note, isPublished } = data;
		const shiftDate = new Date(date);

		const employee = await employeeRepository.findOne({ where: { id: employeeId } });
		if (!employee) throw new Error("Employee not found");

		const store = await storeRepository.findOne({ where: { id: storeId } });
		if (!store) throw new Error("Store not found");

		const availability = await availabilityRepository.findOne({
			where: {
				employee: { id: employeeId },
				date: shiftDate,
				isBlocked: true,
			},
		});

		if (availability) {
			throw new Error("Employee has blocked this date for availability");
		}

		const startHour = parseInt(startTime.split(":")[0]);
		const endHour = parseInt(endTime.split(":")[0]);
		const hours = endHour - startHour;
		const cost = hours * employee.hourlyRate;

		if (employee.currentHours + hours > employee.maxHours) {
			throw new Error("This shift would exceed employee's maximum hours");
		}

		const weekStart = startOfWeek(shiftDate);
		const weekEnd = endOfWeek(shiftDate);

		let weeklyStats = await weeklyStatsRepository.findOne({
			where: {
				store: { id: storeId },
				weekStartDate: Between(weekStart, weekEnd),
			},
		});

		if (!weeklyStats) {
			weeklyStats = weeklyStatsRepository.create({
				store,
				weekStartDate: weekStart,
				weekEndDate: weekEnd,
				budgetAllocated: store.weeklyBudget,
				budgetRemaining: store.weeklyBudget,
			});
			await weeklyStatsRepository.save(weeklyStats);
		}

		if (weeklyStats.totalCost + cost > weeklyStats.budgetAllocated) {
			throw new Error("This shift would exceed the weekly budget");
		}

		const newShift = shiftRepository.create({
			employee,
			store,
			date: shiftDate,
			startTime,
			endTime,
			hours,
			cost,
			note,
			isPublished: isPublished || false,
		});

		if (isPublished) {
			try {
				const eventId = await syncShiftWithGoogleCalendar(newShift);
				if (eventId) newShift.googleCalendarEventId = eventId;
			} catch (error) {
				console.error("Google Calendar sync failed:", error);
			}
		}

		const savedShift = await shiftRepository.save(newShift);

		employee.currentHours += hours;
		await employeeRepository.save(employee);

		weeklyStats.totalHours += hours;
		weeklyStats.totalCost += cost;
		weeklyStats.budgetRemaining -= cost;
		await weeklyStatsRepository.save(weeklyStats);

		return savedShift;
	} catch (error) {
		throw new Error(`Failed to create shift: ${error instanceof Error && error.message}`);
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
	try {
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
			weeklyStats.totalHours -= shift.hours;
			weeklyStats.totalCost -= shift.cost;
			weeklyStats.budgetRemaining += shift.cost;
			await weeklyStatsRepository.save(weeklyStats);
		}

		await shiftRepository.remove(shift);
		return { message: "Shift deleted successfully" };
	} catch (error) {
		throw new Error(`Failed to delete shift: ${error instanceof Error && error.message}`);
	}
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
