import { Router } from "express";
import { requireStoreId } from "../middleware/auth.middleware";
import { getAllEmployees } from "../controllers/employee.controller";
// import { createReservation, getAvailableDates, getAvailableSlots } from "../controllers/reservation.controller";
import {
    createReservation, 
    getAvailableDates,
    getAvailableSlots,
    getReservationById,
    getAllReservations,
    updateReservationStatus,
    cancelReservation
  } from "../controllers/voiceCont.controller";
import { getAllServices } from "../controllers/service.controller";

const router = Router({ mergeParams: true });

router.post("/employees", getAllEmployees);
router.post("/services", getAllServices);
router.post("/reservations", createReservation);
router.post("/reservation/dates", getAvailableDates);
router.post("/reservation/slots", getAvailableSlots);

// New routes
router.post("/reservation/getById", getReservationById);
router.post("/reservation/getAll", getAllReservations);
router.post("/reservation/updateStatus", updateReservationStatus);
router.post("/reservation/cancel", cancelReservation);

export default router;
