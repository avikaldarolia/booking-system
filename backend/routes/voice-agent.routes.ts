import { Router } from "express";
import { requireStoreId } from "../middleware/auth.middleware";
import { getAllEmployees } from "../controllers/employee.controller";
import { getAvailableDates, getAvailableSlots } from "../controllers/reservation.controller";

const router = Router({ mergeParams: true });

router.post("/employees", requireStoreId, getAllEmployees);
router.post("/reservation/dates", requireStoreId, getAvailableDates);
router.post("/reservation/slots", requireStoreId, getAvailableSlots);

export default router;
