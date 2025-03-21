import { Router } from "express";
import { getWeekDetails } from "../controllers/week.controller";

const router = Router();

router.get("/", getWeekDetails);

export default router;
