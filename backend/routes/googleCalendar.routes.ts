import { Router } from "express";
import { getWeekEvents } from "../controllers/googleCalendar.controller";

const router = Router();

router.get("/events", getWeekEvents);

export default router;
