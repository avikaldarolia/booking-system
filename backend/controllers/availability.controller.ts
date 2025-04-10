import { NextFunction, Request, Response } from "express";
import * as utils from "../utils/utils";
import * as availabilityService from "../services/availability.service";

export const getAvailabilityByEmployee = utils.asyncMiddleware(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { employeeId } = req.params;
			const { startDate, endDate } = req.query;

			const availabilities = await availabilityService.GetAvailabilityByEmployee(
				employeeId,
				startDate as string,
				endDate as string
			);

			return utils.sendResponse(req, res, availabilities.success, availabilities.data, availabilities.err);
		} catch (error) {
			next(error);
		}
	}
);

export const createAvailability = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { employeeId, date, startTime, endTime, isBlocked, note } = req.body;

		const newAvailability = await availabilityService.CreateAvailability(
			employeeId,
			date,
			startTime,
			endTime,
			isBlocked,
			note
		);
		return utils.sendResponse(req, res, newAvailability.success, newAvailability.data, newAvailability.err);
	} catch (error) {
		next(error);
	}
});

export const updateAvailability = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { date, startTime, endTime, isBlocked, note } = req.body;

		const updatedAvailability = await availabilityService.UpdateAvailability(
			id,
			date,
			startTime,
			endTime,
			isBlocked,
			note
		);
		return res.status(200).json(updatedAvailability);
	} catch (error) {
		console.error("Error updating availability:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
});

export const deleteAvailability = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		await availabilityService.DeleteAvailability(id);
		return res.status(200).json({ message: "Availability deleted successfully" });
	} catch (error) {
		console.error("Error deleting availability:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
});
