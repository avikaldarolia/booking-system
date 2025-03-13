import { Router } from "express";
import {
	getAllShifts,
	getShiftById,
	createShift,
	updateShift,
	deleteShift,
	publishShift,
	getWeeklyShifts,
} from "../controllers/shift.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

// Employee routes
router.get("/", getAllShifts);
router.get("/weekly", getWeeklyShifts);
router.get("/:id", getShiftById);

// Manager routes
router.post("/", authorize(["manager"]), createShift);
router.put("/:id", authorize(["manager"]), updateShift);
router.delete("/:id", authorize(["manager"]), deleteShift);
router.post("/:id/publish", authorize(["manager"]), publishShift);

export default router;
