import { Router } from "express";
import { checkGoogleCalendarConnection, getWeekEvents } from "../controllers/googleCalendar.controller";

const router = Router();

router.get("/events", getWeekEvents);
router.get("/heartbeat", checkGoogleCalendarConnection);

export default router;
