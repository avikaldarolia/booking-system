import { Router } from "express";
import {
	getAvailabilityByEmployee,
	createAvailability,
	updateAvailability,
	deleteAvailability,
} from "../controllers/availability.controller";

const router = Router();

router.get("/employee/:employeeId", getAvailabilityByEmployee);
router.post("/", createAvailability);
router.put("/:id", updateAvailability);
router.delete("/:id", deleteAvailability);

export default router;
