import { Request, Response } from "express";
import * as utils from "../utils/utils";
import {
	calendarHeartbeat,
	getCalendarEvents,
	insertIntoServiceAccount,
} from "../third-party/google-calendar/googleCalender";
import { startOfWeek, endOfWeek } from "date-fns";

export const insertCalendarToServiceAccount = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { storeId } = req.params;
		const response = await insertIntoServiceAccount(storeId);
		return res.status(200).json(response);
	} catch (error) {
		console.error("Error inserting Google Calendar", error);
		return res.status(500).json({ message: "Internal server error" });
	}
});

export const checkGoogleCalendarConnection = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { storeId } = req.params;
		const response = await calendarHeartbeat(storeId);
		return res.status(200).json(response);
	} catch (error) {
		console.error("Error fetching Google Calendar events:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
});

export const getWeekEvents = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { date } = req.query;

		if (!date) {
			return res.status(400).json({ message: "Date is required" });
		}

		const targetDate = new Date(date as string);
		const weekStart = startOfWeek(targetDate);
		const weekEnd = endOfWeek(targetDate);

		const events = await getCalendarEvents(weekStart, weekEnd);

		return res.status(200).json(events);
	} catch (error) {
		console.error("Error fetching Google Calendar events:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
});
