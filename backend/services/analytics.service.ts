import * as utils from "./../utils/utils";
import { AppDataSource } from "../data-source";
import { Week } from "../entities/Week";
import { Reservation } from "../entities/Reservation";
import { Shift } from "../entities/Shift";
import { WeeklyEmployeeStats } from "../entities/WeeklyEmployeeStats";
import { Between } from "typeorm";

const weekRepository = AppDataSource.getRepository(Week);
const reservationRepository = AppDataSource.getRepository(Reservation);
const shiftRepository = AppDataSource.getRepository(Shift);
const statsRepository = AppDataSource.getRepository(WeeklyEmployeeStats);

/**
 * @param storeId
 * @returns total revenue
 */
export const GetTotalRevenue = async (storeId: string, startDate?: string, endDate?: string) => {
	try {
		console.log(startDate, endDate);

		if (startDate && !endDate) {
			endDate = utils.localeDate(new Date().toISOString()).toISOString();
		}

		let query = weekRepository.createQueryBuilder("week").where("week.storeId = :storeId", { storeId });
		if (startDate && endDate) {
			query.andWhere("week.startDate BETWEEN :startDate AND :endDate", { startDate, endDate });
		}
		query.select("SUM(week.revenue)", "totalRevenue");

		const revenue = utils.parseSafe(await query.getRawOne());

		const totalRevenue = { totalRevenue: revenue?.totalRevenue || 0 };
		return utils.serviceResponse(true, totalRevenue, "");
	} catch (error) {
		throw error;
	}
};

/**
 * @param storeId
 * @param startDate optional
 * @param endDate optional
 * @returns Revenue Per Employee between start and end date (default: as of now).
 */
export const GetRevenuePerEmployee = async (storeId: string, startDate?: string, endDate?: string) => {
	try {
		if (startDate && !endDate) {
			endDate = utils.localeDate(new Date().toISOString()).toISOString();
		}
		const query = reservationRepository
			.createQueryBuilder("reservation")
			.innerJoin("reservation.employee", "employee")
			.where("reservation.storeId = :storeId", { storeId });
		if (startDate && endDate) {
			query.andWhere("reservation.date BETWEEN :startDate AND :endDate", { startDate, endDate });
		}
		query
			.groupBy("reservation.employeeId, employee.id, employee.name, employee.hourlyRate")
			.select(["employee.id as employeeId", "employee.name as name", "SUM(reservation.cost) as revenue"]);

		const data = utils.parseSafe(await query.getRawMany());

		const result = data.map((row: any) => ({
			employeeId: row.employeeId,
			name: row.name,
			revenue: Number(row.revenue) || 0,
		}));
		return utils.serviceResponse(true, result, "");
	} catch (error) {
		throw error;
	}
};

export const GetRevenuePerShift = async (storeId: string, startDate: string, endDate: string) => {
	try {
		if (startDate && !endDate) {
			endDate = utils.localeDate(new Date().toISOString()).toISOString();
		}
		const query = weekRepository
			.createQueryBuilder("week")
			.leftJoin("week.shifts", "shift")
			.where("week.storeId = :storeId", { storeId });
		query
			.andWhere("week.startDate BETWEEN :startDate AND :endDate", { startDate, endDate })
			.groupBy("week.id, week.startDate");
		query.select(["week.startDate as weekStart", "week.revenue / COUNT(shift.id) as avgRevenue"]);

		const data = utils.parseSafe(await query.getRawMany());
		const result = data.map((row) => ({
			weekStart: row.weekStart,
			avgRevenue: Number(row.avgRevenue) || 0,
		}));
		return utils.serviceResponse(true, result, "");
	} catch (error) {
		throw error;
	}
};

export const GetRevenuePerWeek = async (storeId: string, startDateLocal: string, endDateLocal: string) => {
	try {
		if (startDateLocal && !endDateLocal) {
			endDateLocal = utils.localeDate(new Date().toISOString()).toISOString();
		}
		const startDate = utils.localeDate(startDateLocal);
		const endDate = utils.localeDate(endDateLocal);

		const query = weekRepository.createQueryBuilder("week").where("week.storeId = :storeId", { storeId });
		if (startDate && endDate) {
			query.andWhere("week.startDate <= :endDate AND week.endDate >= :startDate", { startDate, endDate });
		}

		query
			.select(["week.startDate", "week.endDate", "week.budget", "week.cost", "week.hours", "week.revenue"])
			.orderBy("week.startDate", "ASC");

		const data = utils.parseSafe(await query.getMany());

		const result = data.map((w) => ({
			startDate: w.startDate,
			endDate: w.endDate,
			cost: w.cost,
			hours: w.hours,
			revenue: w.revenue || 0,
		}));
		return utils.serviceResponse(true, result, "");
	} catch (error) {
		throw error;
	}
};

export const GetHourlyRateEffectiveness = async (storeId: string, startDate: string, endDate: string) => {
	try {
		const query = reservationRepository
			.createQueryBuilder("reservation")
			.innerJoin("reservation.employee", "employee")
			.where("reservation.storeId = :storeId", { storeId })
			.andWhere("reservation.date BETWEEN :startDate AND :endDate", { startDate, endDate })
			.groupBy("reservation.employeeId, employee.id, employee.name, employee.hourlyRate")
			.select([
				"employee.id as employeeId",
				"employee.name as name",
				"employee.hourlyRate as hourlyRate",
				"SUM(reservation.duration * employee.hourlyRate / 60) as revenue",
			]);

		const data = utils.parseSafe(await query.getRawMany());
		const result = data.map((row) => ({
			employeeId: row.employeeId,
			name: row.name,
			hourlyRate: row.hourlyRate || 0,
			revenue: Number(row.revenue) || 0,
		}));
		return utils.serviceResponse(true, result, "");
	} catch (error) {
		throw error;
	}
};

export const GetEmployeeUtilization = async (storeId: string, weekId?: string) => {
	try {
		const query = statsRepository
			.createQueryBuilder("stats")
			.innerJoinAndSelect("stats.employee", "employee")
			.where("stats.storeId = :storeId", { storeId })
			.andWhere(
				weekId ? "stats.weekId = :weekId" : "stats.weekId = (SELECT MAX(id) FROM week WHERE storeId = :storeId)",
				{ weekId, storeId }
			);

		const data = await query.getMany();
		const result = data.map((stat) => ({
			employeeId: stat.employeeId,
			name: stat.employee.name,
			hoursWorked: stat.empHours || 0,
			maxHours: stat.empMaxHours || 0,
			cost: stat.empTotalCost || 0,
		}));
		return utils.serviceResponse(true, result, "");
	} catch (error) {
		throw error;
	}
};

export const GetTotalHoursWorked = async (storeId: string, startDate: string, endDate: string) => {
	try {
		const query = shiftRepository
			.createQueryBuilder("shift")
			.where("shift.storeId = :storeId", { storeId })
			.andWhere("shift.date BETWEEN :startDate AND :endDate", { startDate, endDate })
			.select("SUM(shift.hours)", "totalHours");

		const hours = utils.parseSafe(await query.getRawOne());
		const totalHours = { totalHours: Number(hours?.totalHours) || 0 };
		return utils.serviceResponse(true, totalHours, "");
	} catch (error) {
		throw error;
	}
};

export const GetShiftsVsReservations = async (storeId: string, startDate: string, endDate: string) => {
	try {
		const shiftQuery = shiftRepository
			.createQueryBuilder("shift")
			.select("shift.date", "date")
			.addSelect("COUNT(*)", "shiftCount")
			.where("shift.storeId = :storeId", { storeId })
			.andWhere("shift.date BETWEEN :startDate AND :endDate", { startDate, endDate })
			.groupBy("shift.date");

		const resQuery = reservationRepository
			.createQueryBuilder("reservation")
			.select("reservation.date", "date")
			.addSelect("COUNT(*)", "reservationCount")
			.where("reservation.storeId = :storeId", { storeId })
			.andWhere("reservation.date BETWEEN :startDate AND :endDate", { startDate, endDate })
			.groupBy("reservation.date");

		const shifts = utils.parseSafe(await shiftQuery.getRawMany());
		const reservations = utils.parseSafe(await resQuery.getRawMany());

		const result = shifts.map((shift: Shift) => ({
			date: shift.date,
			shiftCount: Number(shift.shiftCount) || 0,
			reservationCount: Number(reservations.find((r) => r.date === shift.date)?.reservationCount || 0),
		}));
		return utils.serviceResponse(true, result, "");
	} catch (error) {
		throw error;
	}
};

export const GetAvgReservationDuration = async (storeId: string, startDate: string, endDate: string) => {
	try {
		const query = reservationRepository
			.createQueryBuilder("reservation")
			.where("reservation.storeId = :storeId", { storeId })
			.andWhere("reservation.date BETWEEN :startDate AND :endDate", { startDate, endDate })
			.select("AVG(reservation.duration)", "avgDuration");

		const avg = utils.parseSafe(await query.getRawOne());
		const avgDuration = { avgDuration: Number(avg?.avgDuration) || 0 };
		return utils.serviceResponse(true, avgDuration, "");
	} catch (error) {
		throw error;
	}
};

export const GetTopEmployees = async (
	storeId: string,
	startDate: string,
	endDate: string,
	metric: "revenue" | "hours" | "reservations" = "revenue",
	limit: number = 5
) => {
	try {
		let select = "";
		if (metric === "revenue") select = "SUM(reservation.duration * employee.hourlyRate / 60)";
		else if (metric === "hours") select = "SUM(reservation.duration) / 60";
		else select = "COUNT(*)";

		const query = reservationRepository
			.createQueryBuilder("reservation")
			.innerJoin("reservation.employee", "employee")
			.where("reservation.storeId = :storeId", { storeId })
			.andWhere("reservation.date BETWEEN :startDate AND :endDate", { startDate, endDate })
			.groupBy("reservation.employeeId, employee.id, employee.name")
			.select(["employee.id as employeeId", "employee.name as name", `${select} as value`])
			.orderBy("value", "DESC")
			.limit(limit);

		const data = utils.parseSafe(await query.getRawMany());
		const result = data.map((row) => ({
			employeeId: row.employeeId,
			name: row.name,
			value: Number(row.value) || 0,
		}));
		return utils.serviceResponse(true, result, "");
	} catch (error) {
		throw error;
	}
};

export const GetEmployeeNoShowRate = async (storeId: string, startDate: string, endDate: string) => {
	try {
		const query = reservationRepository
			.createQueryBuilder("reservation")
			.innerJoin("reservation.employee", "employee")
			.where("reservation.storeId = :storeId", { storeId })
			.andWhere("reservation.date BETWEEN :startDate AND :endDate", { startDate, endDate })
			.groupBy("reservation.employeeId, employee.id, employee.name")
			.select([
				"employee.id as employeeId",
				"employee.name as name",
				"SUM(CASE WHEN reservation.status = 'cancelled' THEN 1 ELSE 0 END)::float / COUNT(*) as noShowRate",
			]);

		const data = utils.parseSafe(await query.getRawMany());
		const result = data.map((row) => ({
			employeeId: row.employeeId,
			name: row.name,
			noShowRate: Number(row.noShowRate) || 0,
		}));
		return utils.serviceResponse(true, result, "");
	} catch (error) {
		throw error;
	}
};

export const GetReservationFulfillmentRate = async (storeId: string, startDate: string, endDate: string) => {
	try {
		const query = reservationRepository
			.createQueryBuilder("reservation")
			.where("reservation.storeId = :storeId", { storeId })
			.andWhere("reservation.date BETWEEN :startDate AND :endDate", { startDate, endDate })
			.select("SUM(CASE WHEN reservation.status = 'completed' THEN 1 ELSE 0 END)::float / COUNT(*)", "fulfillmentRate");

		const rate = utils.parseSafe(await query.getRawOne());
		const fulfillmentRate = { fulfillmentRate: Number(rate?.fulfillmentRate) || 0 };
		return utils.serviceResponse(true, fulfillmentRate, "");
	} catch (error) {
		throw error;
	}
};

export const GetShiftCostPerEmployee = async (storeId: string, startDate: string, endDate: string) => {
	try {
		const query = statsRepository
			.createQueryBuilder("stats")
			.innerJoin("stats.employee", "employee")
			.innerJoin("stats.week", "week")
			.where("stats.storeId = :storeId", { storeId })
			.andWhere("week.startDate BETWEEN :startDate AND :endDate", { startDate, endDate })
			.groupBy("stats.employeeId, employee.id, employee.name")
			.select(["employee.id as employeeId", "employee.name as name", "SUM(stats.empTotalCost) as totalCost"]);

		const data = utils.parseSafe(await query.getRawMany());
		const result = data.map((row) => ({
			employeeId: row.employeeId,
			name: row.name,
			totalCost: Number(row.totalCost) || 0,
		}));
		return utils.serviceResponse(true, result, "");
	} catch (error) {
		throw error;
	}
};

export const GetWeeklyTrends = async (storeId: string, startDateLocal: string, endDateLocal: string) => {
	try {
		const startDate = utils.localeDate(startDateLocal);
		const endDate = utils.localeDate(endDateLocal);

		const data = await weekRepository.find({
			where: { storeId, startDate: Between(startDate, endDate) },
			select: ["startDate", "revenue", "cost", "hours"],
			order: { startDate: "ASC" },
		});
		const result = data.map((w) => ({
			weekStart: w.startDate,
			revenue: w.revenue || 0,
			cost: w.cost || 0,
			hours: w.hours || 0,
		}));
		return utils.serviceResponse(true, result, "");
	} catch (error) {
		throw error;
	}
};

export const GetBookingTrends = async (
	storeId: string,
	startDateLocal: string,
	endDateLocal: string,
	groupBy: "day" | "week" = "day"
) => {
	try {
		const startDate = utils.localeDate(startDateLocal);
		const endDate = utils.localeDate(endDateLocal);

		const query = reservationRepository
			.createQueryBuilder("reservation")
			.select(`DATE_TRUNC('${groupBy}', reservation.date) as date`)
			.addSelect("COUNT(*) as count")
			.where("reservation.storeId = :storeId", { storeId })
			.andWhere("reservation.date BETWEEN :startDate AND :endDate", { startDate, endDate })
			.groupBy("DATE_TRUNC(:groupBy, reservation.date)")
			.orderBy("date", "ASC");

		const data = utils.parseSafe(await query.getRawMany());
		const result = data.map((row) => ({
			date: row.date,
			count: Number(row.count) || 0,
		}));
		return utils.serviceResponse(true, result, "");
	} catch (error) {
		throw error;
	}
};

export const GetReservationStatusBreakdown = async (storeId: string, startDate: string, endDate: string) => {
	try {
		const query = reservationRepository
			.createQueryBuilder("reservation")
			.where("reservation.storeId = :storeId", { storeId })
			.andWhere("reservation.date BETWEEN :startDate AND :endDate", { startDate, endDate })
			.groupBy("reservation.status")
			.select(["reservation.status as status", "COUNT(*) as count"]);

		const data = utils.parseSafe(await query.getRawMany());
		const result = data.map((row) => ({
			status: row.status,
			count: Number(row.count) || 0,
		}));
		return utils.serviceResponse(true, result, "");
	} catch (error) {
		throw error;
	}
};

export const GetShiftOverlaps = async (storeId: string, startDate: string, endDate: string) => {
	try {
		const query = shiftRepository
			.createQueryBuilder("s1")
			.innerJoin(
				"shift",
				"s2",
				`
        s1.employeeId = s2.employeeId AND
        s1.date = s2.date AND
        s1.startTime < s2.endTime AND
        s1.endTime > s2.startTime AND
        s1.id != s2.id
      `
			)
			.where("s1.storeId = :storeId", { storeId })
			.andWhere("s1.date BETWEEN :startDate AND :endDate", { startDate, endDate })
			.select("COUNT(DISTINCT s1.id) / 2", "overlapCount");

		const overlaps = utils.parseSafe(await query.getRawOne());
		const overlapCount = { overlapCount: Number(overlaps?.overlapCount) || 0 };
		return utils.serviceResponse(true, overlapCount, "");
	} catch (error) {
		throw error;
	}
};

export const GetPeakBookingTimes = async (storeId: string, startDate: string, endDate: string) => {
	try {
		const query = reservationRepository
			.createQueryBuilder("reservation")
			.where("reservation.storeId = :storeId", { storeId })
			.andWhere("reservation.date BETWEEN :startDate AND :endDate", { startDate, endDate })
			.groupBy("EXTRACT(HOUR FROM reservation.startTime)")
			.select(["EXTRACT(HOUR FROM reservation.startTime) as hour", "COUNT(*) as count"])
			.orderBy("hour", "ASC");

		const data = utils.parseSafe(await query.getRawMany());
		const result = data.map((row) => ({
			hour: Number(row.hour) || 0,
			count: Number(row.count) || 0,
		}));
		return utils.serviceResponse(true, result, "");
	} catch (error) {
		throw error;
	}
};
