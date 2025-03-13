import { Router } from "express";
import {
	getAvailabilityByEmployee,
	createAvailability,
	updateAvailability,
	deleteAvailability,
} from "../controllers/availability.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Protected routes
router.use(authenticate);

router.get("/employee/:employeeId", getAvailabilityByEmployee);
router.post("/", createAvailability);
router.put("/:id", updateAvailability);
router.delete("/:id", deleteAvailability);

export default router;
