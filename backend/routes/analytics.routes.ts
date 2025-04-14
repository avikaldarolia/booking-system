import { Router } from "express";
import {
	getPeakBookingTimes,
	getBookingTrends,
	getEmployeeNoShowRate,
	getEmployeeUtilization,
	getShiftsVsReservations,
	getTotalHoursWorked,
	getRevenuePerEmployee,
	getRevenuePerShift,
	getRevenuePerWeek,
	getTotalRevenue,
	getRevenueVsCost,
	getHourlyRateEffectiveness,
	getAvgReservationDuration,
	getTopEmployees,
	getReservationFulfillmentRate,
	getShiftCostPerEmployee,
	getWeeklyTrends,
	getReservationStatusBreakdown,
	getShiftOverlaps,
} from "../controllers/analytics.controller";
import { requireStoreId } from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

router.get("/revenue/total", requireStoreId, getTotalRevenue);
router.get("/revenue/employee", requireStoreId, getRevenuePerEmployee);
router.get("/revenue/shift", requireStoreId, getRevenuePerShift);
router.get("/revenue/weekly", requireStoreId, getRevenuePerWeek);
router.get("/revenue-cost", requireStoreId, getRevenueVsCost);
router.get("/hourly-rate-effectiveness", requireStoreId, getHourlyRateEffectiveness);
router.get("/employee-utilization", requireStoreId, getEmployeeUtilization);
router.get("/hours-worked", requireStoreId, getTotalHoursWorked);
router.get("/shifts-vs-reservations", requireStoreId, getShiftsVsReservations);
router.get("/reservation-duration", requireStoreId, getAvgReservationDuration);
router.get("/top-employees", requireStoreId, getTopEmployees);
router.get("/employee-no-show", requireStoreId, getEmployeeNoShowRate);
router.get("/reservation-fulfillment", requireStoreId, getReservationFulfillmentRate);
router.get("/shift-cost", requireStoreId, getShiftCostPerEmployee);
router.get("/weekly-trends", requireStoreId, getWeeklyTrends);
router.get("/booking-trends", requireStoreId, getBookingTrends);
router.get("/reservation-status", requireStoreId, getReservationStatusBreakdown);
router.get("/shift-overlaps", requireStoreId, getShiftOverlaps);
router.get("/peak-times", requireStoreId, getPeakBookingTimes);

export default router;
