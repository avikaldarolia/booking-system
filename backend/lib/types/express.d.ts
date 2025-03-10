import { Request } from "express";
import { IJwtPayload } from "../../controllers/auth.controller";

declare global {
	namespace Express {
		interface Request {
			user?: IJwtPayload;
		}
	}
}
