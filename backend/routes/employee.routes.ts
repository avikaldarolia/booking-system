import { Router } from "express";
import {
	getAllEmployees,
	getEmployeeById,
	createEmployee,
	updateEmployee,
	deleteEmployee,
} from "../controllers/employee.controller";
import { authenticate, authorize, requireStoreId } from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

// Public routes
router.get("/", getAllEmployees);
router.get("/:id", getEmployeeById);

// Protected routes
router.use(authenticate);

// router.get("/:id", getEmployeeById);
router.post("/", authorize(["manager"]), createEmployee);
router.put("/:id", authorize(["manager"]), updateEmployee);
router.delete("/:id", authorize(["manager"]), deleteEmployee);

export default router;
