import { NextFunction, Request, Response } from "express";
import * as WeekService from "../services/week.service";
import * as utils from "../utils/utils";

export const getWeekDetails = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { startDate, endDate, storeId } = req.query;
		const employees = await WeekService.GetWeekDetails(startDate as string, endDate as string, storeId as string);
		return utils.sendResponse(req, res, employees.success, employees.data, employees.err);
	} catch (error) {
		next(error);
	}
});

export const getWeeklyStatsHistory = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { storeId, weeks } = req.query;

		const statsHistory = await WeekService.GetWeekStatsHistory(storeId as string, weeks as string);
		return res.status(200).json(statsHistory);
	} catch (error) {
		next(error);
	}
});
