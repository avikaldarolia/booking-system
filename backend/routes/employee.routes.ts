import { Router } from "express";
import {
	getAllEmployees,
	getEmployeeById,
	createEmployee,
	updateEmployee,
	deleteEmployee,
	resetEmployeeHours,
} from "../controllers/employee.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/", getAllEmployees);

// Protected routes
router.use(authenticate);

router.get("/:id", getEmployeeById);
router.post("/", authorize(["manager"]), createEmployee);
router.put("/:id", authorize(["manager"]), updateEmployee);
router.delete("/:id", authorize(["manager"]), deleteEmployee);
router.post("/reset-hours/:storeId", authorize(["manager"]), resetEmployeeHours);

export default router;
