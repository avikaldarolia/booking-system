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

const router = Router();

router.get("/", getAllShifts);
router.get("/weekly", getWeeklyShifts);
router.get("/:id", getShiftById);
router.post("/", createShift);
router.put("/:id", updateShift);
router.delete("/:id", deleteShift);
router.post("/:id/publish", publishShift);

export default router;
