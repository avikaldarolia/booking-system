import { Router } from "express";
import {
	getAllReservations,
	getReservationById,
	createReservation,
	updateReservationStatus,
	cancelReservation,
	getAvailableSlots,
	getAvailableDates,
} from "../controllers/reservation.controller";
import { authenticate, authorize, requireStoreId } from "../middleware/auth.middleware";

const router = Router();

router.post("/", requireStoreId, createReservation);

router.get("/dates", requireStoreId, getAvailableDates);
router.get("/slots", requireStoreId, getAvailableSlots);

// // Protected routes
router.use(authenticate);

router.get("/", authorize(["customer", "manager", "associate", "part_time"]), getAllReservations);

// router.get("/slots", getAvailableSlots);
// router.get("/:id", getReservationById);

// // Routes for managers and employees

// // Routes for customers
// router.post("/", authorize(["customer"]), createReservation);

// router.post("/:id/cancel", authorize(["customer"]), cancelReservation);

// // Routes for managers and employees
// router.patch("/:id/status", authorize(["manager", "associate"]), updateReservationStatus);

export default router;
