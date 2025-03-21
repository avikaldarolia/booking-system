import { NextFunction, Request, Response } from "express";
import * as utils from "../utils/utils";
import * as ShiftService from "../services/shift.service";

/**
 * Get All shifts
 */
export const getAllShifts = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId, startDate, endDate, employeeId } = req.query;
		const shifts = await ShiftService.GetAllShifts(
			storeId as string,
			startDate as string,
			endDate as string,
			employeeId as string
		);
		return utils.sendResponse(req, res, shifts.success, shifts.data, shifts.err);
	} catch (error: any) {
		next(error);
	}
});

/**
 * Get shift by ID
 */
export const getShiftById = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const shift = await ShiftService.GetShiftById(id);
		return res.status(200).json(shift);
	} catch (error: any) {
		next(error);
	}
});

/**
 * Create shift.
 */
export const createShift = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const shift = await ShiftService.createShift(req.body);
		return utils.sendResponse(req, res, shift.success, shift.data, shift.err);
	} catch (error) {
		next(error);
	}
});

/**
 * Deletes a shift
 */
export const deleteShift = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const result = await ShiftService.deleteShift(id);
		return res.status(200).json(result);
	} catch (error: any) {
		console.error("Controller error deleting shift:", error);
		return res.status(error.message === "Shift not found" ? 404 : 500).json({
			message: error.message || "Internal server error",
		});
	}
});

/**
 * Get Weekly Shifts
 */
export const getWeeklyShifts = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId, date, weekId } = req.query;
		const shifts = await ShiftService.GetWeeklyShifts(storeId as string, date as string, weekId as string | undefined);

		return utils.sendResponse(req, res, shifts.success, shifts.data, shifts.err);
	} catch (error: any) {
		next(error);
	}
});

// export const updateShift = utils.asyncMiddleware(async (req: Request, res: Response) => {
// 	try {
// 		const { id } = req.params;
// 		const shift = await ShiftService.updateShift(id, req.body);
// 		return res.status(200).json(shift);
// 	} catch (error: any) {
// 		console.error("Controller error updating shift:", error);
// 		const status: { [key: string]: number } = {
// 			"Shift not found": 404,
// 			"Employee not found": 404,
// 			"Weekly stats not found": 404,
// 			"This shift would exceed employee's maximum hours": 400,
// 			"This shift would exceed the weekly budget": 400,
// 		};

// 		// Use the error message to lookup status, default to 500
// 		const errorStatus = status[error.message] || 500;

// 		return res.status(errorStatus).json({
// 			message: error.message || "Internal server error",
// 		});
// 	}
// });

// export const publishShift = utils.asyncMiddleware(async (req: Request, res: Response) => {
// 	try {
// 		const { id } = req.params;
// 		const shift = await ShiftService.publishShift(id);
// 		return res.status(200).json(shift);
// 	} catch (error: any) {
// 		console.error("Controller error publishing shift:", error);
// 		return res.status(error.message === "Shift not found" ? 404 : 500).json({
// 			message: error.message || "Internal server error",
// 		});
// 	}
// });
