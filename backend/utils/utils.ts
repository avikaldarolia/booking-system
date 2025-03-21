import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { addMinutes, parseISO } from "date-fns";
import { IServiceResponse } from "../types/types";

/**
 * Async middleware to use await and async calls in express middleware ( For Controllers)
 * @param fn Function
 * @returns
 */
export const asyncMiddleware =
	(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
	(req: Request, res: Response, next: NextFunction) =>
		Promise.resolve(fn(req, res, next)).catch(next);

export async function runInTransaction<T>(operation: (queryRunner: any) => Promise<T>): Promise<IServiceResponse<T>> {
	const queryRunner = AppDataSource.createQueryRunner();
	await queryRunner.connect();
	await queryRunner.startTransaction();

	try {
		const result = await operation(queryRunner);
		await queryRunner.commitTransaction();
		return serviceResponse(true, result, "");
	} catch (error) {
		await queryRunner.rollbackTransaction();
		throw error;
	} finally {
		await queryRunner.release();
	}
}

/**
 * Helper function to calculate shift hours.
 */
export const calculateShiftHours = (startTime: string, endTime: string): number => {
	return parseInt(endTime.split(":")[0]) - parseInt(startTime.split(":")[0]);
};

/**
 * Helper function to calculate shift cost.
 */
export const calculateShiftCost = (hours: number, hourlyRate: number): number => {
	return Number(hours) * Number(hourlyRate);
};

/**
 *
 * @param date
 * @returns
 */
export const localeDate = (date: string) => {
	const isoDate = parseISO(date);
	const fDate = addMinutes(isoDate, isoDate.getTimezoneOffset());
	return fDate;
};

export const normalizeTime = (time: string) => (time?.length === 5 ? `${time}:00` : time);

/**
 * Function to handle Errors that occur
 * @param err any
 * @param req
 * @param res
 * @param next
 */
export const errorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
	try {
		console.log("Error in errorHandler: ", req.url, req.body, err);
		const errorMessage = err instanceof Error ? err.message : "Something went wrong";

		let response = {
			success: false,
			data: {},
			error: errorMessage,
		};

		res.send(response);
	} catch (err) {
		next(err);
	}
};

/**
 * Send response back to the user
 * @param {*} req Request that came
 * @param {*} res Response to be sent
 * @param {*} success  If the request was a success or not
 * @param {*} data Any Data to be return
 * @param {*} err Error if any in the data
 */
export const sendResponse = (req: Request, res: Response, success: boolean, data: any, err: any) => {
	return res.json({
		success,
		data,
		error: err,
	});
};

/**
 * Default response from any function to be sent back so that it is known if the function ran successfully
 * And if it did then what was the data that was there
 * @param {Boolean} success
 * @param {*} data
 * @param {*} err
 * @returns
 */
export const serviceResponse = (success: boolean, data: any, err: any) => {
	return {
		success,
		data,
		err,
	};
};

/**
 * Safely parse the data
 *
 * @param data
 * @returns {any}
 */
export const parseSafe = (data: any) => {
	return JSON.parse(JSON.stringify(data));
};
