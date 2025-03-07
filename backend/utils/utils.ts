import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";

/**
 * Async middleware to use await and async calls in express middleware ( For Controllers)
 * @param fn Function
 * @returns
 */
export const asyncMiddleware =
	(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
	(req: Request, res: Response, next: NextFunction) =>
		Promise.resolve(fn(req, res, next)).catch(next);

export async function runInTransaction<T>(operation: (queryRunner: any) => Promise<T>): Promise<T> {
	const queryRunner = AppDataSource.createQueryRunner();
	await queryRunner.connect();
	await queryRunner.startTransaction();

	try {
		const result = await operation(queryRunner);
		await queryRunner.commitTransaction();
		return result;
	} catch (error) {
		await queryRunner.rollbackTransaction();
		console.error("Transaction failed:", error);
		throw new Error(`Transaction failed: ${error instanceof Error ? error.message : error}`);
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
	return hours * hourlyRate;
};

export const getStartDate = (date: Date) => {
	return new Date(`${date}T00:00:00`); // Local midnight
};

export const getEndDate = (date: Date) => {
	return new Date(`${date}T23:59:59:5999`);
};

export const normalizeTime = (time: string) => (time.length === 5 ? `${time}:00` : time);
