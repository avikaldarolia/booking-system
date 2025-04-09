import { NextFunction, Request, Response } from "express";
import * as utils from "../utils/utils";
import * as weeklyStatsService from "../services/weekly-employee-stats.service";

export const getWeeklyEmployeeStats = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId, weekId } = req.query;

		if (!storeId) {
			return res.status(400).json({ message: "Store ID is required" });
		}

		const stats = await weeklyStatsService.GetWeeklyStats(storeId as string, weekId as string);
		return utils.sendResponse(req, res, stats.success, stats.data, stats.err);
	} catch (error) {
		next(error);
	}
});

// export const updateWeeklyStats = utils.asyncMiddleware(async (req: Request, res: Response) => {
// 	try {
// 		const { id } = req.params;
// 		const { budgetAllocated, notes } = req.body;

// 		const updatedStats = await weeklyStatsService.UpdateWeeklyStats(id, budgetAllocated, notes);
// 		return res.status(200).json(updatedStats);
// 	} catch (error) {
// 		console.error("Error updating weekly stats:", error);
// 		return res.status(500).json({ message: "Internal server error" });
// 	}
// });

// export const getWeeklyStatsHistory = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
// 	try {
// 		const { storeId, weeks } = req.query;

// 		if (!storeId) {
// 			return res.status(400).json({ message: "Store ID is required" });
// 		}

// 		const statsHistory = await weeklyStatsService.GetWeeklyStatsHistory(storeId as string, weeks as string);
// 		return res.status(200).json(statsHistory);
// 	} catch (error) {
// 		next(error);
// 	}
// });
