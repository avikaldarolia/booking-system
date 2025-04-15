import { Router } from "express";
import { requireStoreId } from "../middleware/auth.middleware";
import { getAllEmployees } from "../controllers/employee.controller";
import { createReservation, getAvailableDates, getAvailableSlots } from "../controllers/reservation.controller";
import { getAllServices } from "../controllers/service.controller";

const router = Router({ mergeParams: true });

router.post("/employees", getAllEmployees);
router.post("/services", getAllServices);
router.post("/reservations", createReservation);
router.post("/reservation/dates", getAvailableDates);
router.post("/reservation/slots", getAvailableSlots);

export default router;
