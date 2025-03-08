import { Router } from "express";
import {
	getAllReservations,
	getReservationById,
	createReservation,
	updateReservationStatus,
	cancelReservation,
	getAvailableSlots,
} from "../controllers/reservation.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";

const router = Router();

// Protected routes
router.use(authenticate);

// Routes accessible by all authenticated users
router.get("/slots", getAvailableSlots);
router.get("/:id", getReservationById);

// Routes for managers and employees
router.get("/", authorize(["manager", "associate", "customer"]), getAllReservations);

// Routes for customers
router.post("/", authorize(["customer"]), createReservation);

router.post("/:id/cancel", authorize(["customer"]), cancelReservation);

// Routes for managers and employees
router.patch("/:id/status", authorize(["manager", "associate"]), updateReservationStatus);

export default router;
