import { Router } from "express";
import { getWeeklyStats, updateWeeklyStats } from "../controllers/weekly-employee-stats.controller";

const router = Router();

router.get("/", getWeeklyStats);
// router.get("/history", getWeeklyStatsHistory);
router.put("/:id", updateWeeklyStats);

export default router;
