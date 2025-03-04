import { Request, Response, NextFunction } from "express";

/**
 * Async middleware to use await and async calls in express middleware ( For Controllers)
 * @param fn Function
 * @returns
 */
export const asyncMiddleware =
	(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
	(req: Request, res: Response, next: NextFunction) =>
		Promise.resolve(fn(req, res, next)).catch(next);
