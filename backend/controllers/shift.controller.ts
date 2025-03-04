// shift.controller.ts
import { Request, Response } from "express";
import * as utils from "../utils/utils";
import * as ShiftService from "../services/shift.service";

export const getAllShifts = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { storeId, startDate, endDate, employeeId } = req.query;
		const shifts = await ShiftService.getAllShifts(
			storeId as string,
			startDate as string,
			endDate as string,
			employeeId as string
		);
		return res.status(200).json(shifts);
	} catch (error: any) {
		console.error("Controller error fetching shifts:", error);
		return res.status(500).json({ message: error.message || "Internal server error" });
	}
});

export const getShiftById = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const shift = await ShiftService.getShiftById(id);
		return res.status(200).json(shift);
	} catch (error: any) {
		console.error("Controller error fetching shift:", error);
		return res.status(error.message === "Shift not found" ? 404 : 500).json({
			message: error.message || "Internal server error",
		});
	}
});

export const createShift = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const shift = await ShiftService.createShift(req.body);
		return res.status(201).json(shift);
	} catch (error: any) {
		console.error("Controller error creating shift:", error);
		const status: { [key: string]: number } = {
			"Employee not found": 404,
			"Store not found": 404,
			"Employee has blocked this date for availability": 400,
			"This shift would exceed employee's maximum hours": 400,
			"This shift would exceed the weekly budget": 400,
		};

		const errorStatus = status[error.message] || 500;

		return res.status(errorStatus).json({
			message: error.message || "Internal server error",
		});
	}
});

export const updateShift = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const shift = await ShiftService.updateShift(id, req.body);
		return res.status(200).json(shift);
	} catch (error: any) {
		console.error("Controller error updating shift:", error);
		const status: { [key: string]: number } = {
			"Shift not found": 404,
			"Employee not found": 404,
			"Weekly stats not found": 404,
			"This shift would exceed employee's maximum hours": 400,
			"This shift would exceed the weekly budget": 400,
		};

		// Use the error message to lookup status, default to 500
		const errorStatus = status[error.message] || 500;

		return res.status(errorStatus).json({
			message: error.message || "Internal server error",
		});
	}
});

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

export const publishShift = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const shift = await ShiftService.publishShift(id);
		return res.status(200).json(shift);
	} catch (error: any) {
		console.error("Controller error publishing shift:", error);
		return res.status(error.message === "Shift not found" ? 404 : 500).json({
			message: error.message || "Internal server error",
		});
	}
});

export const getWeeklyShifts = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { storeId, date } = req.query;
		const shifts = await ShiftService.getWeeklyShifts(storeId as string, date as string);
		return res.status(200).json(shifts);
	} catch (error: any) {
		console.error("Controller error fetching weekly shifts:", error);
		return res.status(error.message === "Store ID and date are required" ? 400 : 500).json({
			message: error.message || "Internal server error",
		});
	}
});
