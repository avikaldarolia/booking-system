import { Router } from "express";
import { getWeeklyStats, updateWeeklyStats, getWeeklyStatsHistory } from "../controllers/weeklyStats.controller";

const router = Router();

router.get("/", getWeeklyStats);
router.get("/history", getWeeklyStatsHistory);
router.put("/:id", updateWeeklyStats);

export default router;
