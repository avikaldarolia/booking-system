import { Router } from "express";
import { getWeekDetails, getWeeklyStatsHistory } from "../controllers/week.controller";

const router = Router();

router.get("/", getWeekDetails);
router.get("/history", getWeeklyStatsHistory);

export default router;
