import { Request, Response } from "express";
import * as utils from "../utils/utils";
import * as weeklyStatsService from "../services/weeklyStats.service";

export const getWeeklyStats = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { storeId, date } = req.query;

		if (!storeId) {
			return res.status(400).json({ message: "Store ID is required" });
		}

		const stats = await weeklyStatsService.GetWeeklyStats(storeId as string, date as string);
		return res.status(200).json(stats);
	} catch (error) {
		console.error("Error fetching weekly stats:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
});

export const updateWeeklyStats = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { budgetAllocated, notes } = req.body;

		const updatedStats = await weeklyStatsService.UpdateWeeklyStats(id, budgetAllocated, notes);
		return res.status(200).json(updatedStats);
	} catch (error) {
		console.error("Error updating weekly stats:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
});

export const getWeeklyStatsHistory = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { storeId, weeks } = req.query;

		if (!storeId) {
			return res.status(400).json({ message: "Store ID is required" });
		}

		const statsHistory = await weeklyStatsService.GetWeeklyStatsHistory(storeId as string, weeks as string);
		return res.status(200).json(statsHistory);
	} catch (error) {
		console.error("Error fetching weekly stats history:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
});
