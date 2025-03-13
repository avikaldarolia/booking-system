import * as utils from "../utils/utils";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

interface AuthRequest extends Request {
	user?: {
		id: string;
		email: string;
		role: string;
	};
}

export const authenticate = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ message: "No token provided" });
		}

		const decoded = jwt.verify(token, JWT_SECRET) as {
			id: string;
			email: string;
			role: string;
		};

		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ message: "Invalid token" });
	}
});

export const authorize = (roles: string[]) =>
	utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
		try {
			if (!req.user || !roles.includes(req.user.role)) {
				return res.status(403).json({ message: "Unauthorized" });
			}
			next();
		} catch (error) {
			return res.status(500).json({ message: "Authorization error" });
		}
	});
