import { NextFunction, Request, Response } from "express";
import * as AnalyticsService from "../services/analytics.service";
import * as utils from "../utils/utils";

/**
 * Get total revenue
 */
export const getTotalRevenue = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId } = req.params;
		const totalRevenue = await AnalyticsService.GetTotalRevenue(storeId);
		return utils.sendResponse(req, res, totalRevenue.success, totalRevenue.data, totalRevenue.err);
	} catch (error) {
		next(error);
	}
});

/**
 * Revenue Per Employee
 */
export const getRevenuePerEmployee = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId } = req.params;
		const { startDate, endDate } = req.query;
		const employeeRevenue = await AnalyticsService.GetRevenuePerEmployee(
			storeId,
			startDate as string,
			endDate as string
		);
		return utils.sendResponse(req, res, employeeRevenue.success, employeeRevenue.data, employeeRevenue.err);
	} catch (error) {
		next(error);
	}
});

/**
 * Revenue Per Shift
 */
export const getRevenuePerShift = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId } = req.params;
		const { startDate, endDate } = req.query;
		const shiftRevenue = await AnalyticsService.GetRevenuePerShift(storeId, startDate as string, endDate as string);
		return utils.sendResponse(req, res, shiftRevenue.success, shiftRevenue.data, shiftRevenue.err);
	} catch (error) {
		next(error);
	}
});

/**
 * Revenue Per Week
 */
export const getRevenuePerWeek = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId } = req.params;
		const { startDate, endDate } = req.query;
		const weeklyRevenue = await AnalyticsService.GetRevenuePerWeek(storeId, startDate as string, endDate as string);
		return utils.sendResponse(req, res, weeklyRevenue.success, weeklyRevenue.data, weeklyRevenue.err);
	} catch (error) {
		next(error);
	}
});

/**
 * Revenue vs. Cost
 */
export const getRevenueVsCost = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId } = req.params;
		const { startDate, endDate } = req.query;
		const revenueCost = await AnalyticsService.GetRevenueVsCost(storeId, startDate as string, endDate as string);
		return utils.sendResponse(req, res, revenueCost.success, revenueCost.data, revenueCost.err);
	} catch (error) {
		next(error);
	}
});

/**
 * Hourly Rate Effectiveness
 */
export const getHourlyRateEffectiveness = utils.asyncMiddleware(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { storeId } = req.params;
			const { startDate, endDate } = req.query;
			const effectiveness = await AnalyticsService.GetHourlyRateEffectiveness(
				storeId,
				startDate as string,
				endDate as string
			);
			return utils.sendResponse(req, res, effectiveness.success, effectiveness.data, effectiveness.err);
		} catch (error) {
			next(error);
		}
	}
);

/**
 * Employee Utilization Rate
 */
export const getEmployeeUtilization = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId } = req.params;
		const { weekId } = req.query;
		const utilization = await AnalyticsService.GetEmployeeUtilization(storeId, weekId as string);
		return utils.sendResponse(req, res, utilization.success, utilization.data, utilization.err);
	} catch (error) {
		next(error);
	}
});

/**
 * Total Hours Worked
 */
export const getTotalHoursWorked = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId } = req.params;
		const { startDate, endDate } = req.query;
		const hours = await AnalyticsService.GetTotalHoursWorked(storeId, startDate as string, endDate as string);
		return utils.sendResponse(req, res, hours.success, hours.data, hours.err);
	} catch (error) {
		next(error);
	}
});

/**
 * Shifts vs. Reservations
 */
export const getShiftsVsReservations = utils.asyncMiddleware(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { storeId } = req.params;
			const { startDate, endDate } = req.query;
			const shiftsVsReservations = await AnalyticsService.GetShiftsVsReservations(
				storeId,
				startDate as string,
				endDate as string
			);
			return utils.sendResponse(
				req,
				res,
				shiftsVsReservations.success,
				shiftsVsReservations.data,
				shiftsVsReservations.err
			);
		} catch (error) {
			next(error);
		}
	}
);

/**
 * Avg. Reservation Duration
 */
export const getAvgReservationDuration = utils.asyncMiddleware(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { storeId } = req.params;
			const { startDate, endDate } = req.query;
			const avgDuration = await AnalyticsService.GetAvgReservationDuration(
				storeId,
				startDate as string,
				endDate as string
			);
			return utils.sendResponse(req, res, avgDuration.success, avgDuration.data, avgDuration.err);
		} catch (error) {
			next(error);
		}
	}
);

/**
 * Top Performing Employees
 */
export const getTopEmployees = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId } = req.params;
		const { startDate, endDate, metric = "revenue", limit = "5" } = req.query;
		const topEmployees = await AnalyticsService.GetTopEmployees(
			storeId,
			startDate as string,
			endDate as string,
			metric as "revenue" | "hours" | "reservations",
			Number(limit)
		);
		return utils.sendResponse(req, res, topEmployees.success, topEmployees.data, topEmployees.err);
	} catch (error) {
		next(error);
	}
});

/**
 * Employee No-Show Rate
 */
export const getEmployeeNoShowRate = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId } = req.params;
		const { startDate, endDate } = req.query;
		const noShowRate = await AnalyticsService.GetEmployeeNoShowRate(storeId, startDate as string, endDate as string);
		return utils.sendResponse(req, res, noShowRate.success, noShowRate.data, noShowRate.err);
	} catch (error) {
		next(error);
	}
});

/**
 * Reservation Fulfillment Rate
 */
export const getReservationFulfillmentRate = utils.asyncMiddleware(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { storeId } = req.params;
			const { startDate, endDate } = req.query;
			const fulfillmentRate = await AnalyticsService.GetReservationFulfillmentRate(
				storeId,
				startDate as string,
				endDate as string
			);
			return utils.sendResponse(req, res, fulfillmentRate.success, fulfillmentRate.data, fulfillmentRate.err);
		} catch (error) {
			next(error);
		}
	}
);

/**
 * Shift Cost per Employee
 */
export const getShiftCostPerEmployee = utils.asyncMiddleware(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { storeId } = req.params;
			const { startDate, endDate } = req.query;
			const shiftCost = await AnalyticsService.GetShiftCostPerEmployee(storeId, startDate as string, endDate as string);
			return utils.sendResponse(req, res, shiftCost.success, shiftCost.data, shiftCost.err);
		} catch (error) {
			next(error);
		}
	}
);

/**
 * Weekly Trends
 */
export const getWeeklyTrends = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId } = req.params;
		const { startDate, endDate } = req.query;
		const trends = await AnalyticsService.GetWeeklyTrends(storeId, startDate as string, endDate as string);
		return utils.sendResponse(req, res, trends.success, trends.data, trends.err);
	} catch (error) {
		next(error);
	}
});

/**
 * Booking Trends
 */
export const getBookingTrends = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId } = req.params;
		const { startDate, endDate, groupBy = "day" } = req.query;
		const trends = await AnalyticsService.GetBookingTrends(
			storeId,
			startDate as string,
			endDate as string,
			groupBy as "day" | "week"
		);
		return utils.sendResponse(req, res, trends.success, trends.data, trends.err);
	} catch (error) {
		next(error);
	}
});

/**
 * Reservation Status Breakdown
 */
export const getReservationStatusBreakdown = utils.asyncMiddleware(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { storeId } = req.params;
			const { startDate, endDate } = req.query;
			const breakdown = await AnalyticsService.GetReservationStatusBreakdown(
				storeId,
				startDate as string,
				endDate as string
			);
			return utils.sendResponse(req, res, breakdown.success, breakdown.data, breakdown.err);
		} catch (error) {
			next(error);
		}
	}
);

/**
 * Overlap/Conflicts in Shifts
 */
export const getShiftOverlaps = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId } = req.params;
		const { startDate, endDate } = req.query;
		const overlaps = await AnalyticsService.GetShiftOverlaps(storeId, startDate as string, endDate as string);
		return utils.sendResponse(req, res, overlaps.success, overlaps.data, overlaps.err);
	} catch (error) {
		next(error);
	}
});

/**
 * Peak Booking Times
 */
export const getPeakBookingTimes = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId } = req.params;
		const { startDate, endDate } = req.query;
		const peakTimes = await AnalyticsService.GetPeakBookingTimes(storeId, startDate as string, endDate as string);
		return utils.sendResponse(req, res, peakTimes.success, peakTimes.data, peakTimes.err);
	} catch (error) {
		next(error);
	}
});
