import { Router } from "express";
import { getWeeklyEmployeeStats } from "../controllers/weekly-employee-stats.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", authorize(["manager", "associate", "part_time"]), getWeeklyEmployeeStats);
// router.get("/history", getWeeklyStatsHistory);
// router.put("/:id", updateWeeklyStats);

export default router;
