import * as utils from "../utils/utils";
import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Reservation, ReservationStatus } from "../entities/Reservation";
import * as ReservationService from "../services/reservation.service";

const reservationRepository = AppDataSource.getRepository(Reservation);

export const getAvailableDates = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { employeeId, storeId } = req.body;
        const dates = await ReservationService.GetAvailableDates(employeeId, storeId);

        return utils.sendResponse(req, res, dates.success, dates.data, dates.err);
    } catch (error) {
        next(error);
    }
});

export const getReservationById = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        const reservation = await reservationRepository.findOne({
            where: { id },
            relations: ["employee", "customer"],
        });

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        return res.status(200).json(reservation);
    } catch (error) {
        console.error("Error fetching reservation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export const createReservation = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { employeeId, name, email, phone, date, startTime, notes, service, storeId } = req.body;

        const reservation = await ReservationService.CreateReservation(
            employeeId,
            name,
            email,
            phone,
            date,
            startTime,
            service,
            storeId,
            notes
        );

        return utils.sendResponse(req, res, reservation.success, reservation.data, reservation.err);
    } catch (error) {
        next(error);
    }
});

export const getAllReservations = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { employeeId, customerId, startDate, endDate, status } = req.body;
        const user = req.user;

        if (!user || !user.role) {
            return res.status(401).json({ message: "Unauthorized: User not authenticated" });
        }

        const reservations = await ReservationService.GetReservations(
            employeeId,
            customerId,
            user,
            startDate,
            endDate,
            status as ReservationStatus
        );

        return utils.sendResponse(req, res, reservations.success, reservations.data, reservations.err);
    } catch (error) {
        next(error);
    }
});

export const updateReservationStatus = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, status } = req.body;

        const reservation = await reservationRepository.findOne({
            where: { id },
            relations: ["employee", "customer"],
        });

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        reservation.status = status;
        const updatedReservation = await reservationRepository.save(reservation);
        return res.status(200).json(updatedReservation);
    } catch (error) {
        console.error("Error updating reservation status:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

export const cancelReservation = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.body;
        const reservation = await reservationRepository.findOne({
            where: { id },
            relations: ["employee", "customer"],
        });

        if (!reservation) {
            return res.status(404).json({ message: "Reservation not found" });
        }

        reservation.status = ReservationStatus.CANCELLED;
        const updatedReservation = await reservationRepository.save(reservation);
        return res.status(200).json(updatedReservation);
    } catch (error) {
        console.error("Error cancelling reservation:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * Get Available slots for an employee on a selected date.
 */
export const getAvailableSlots = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { employeeId, date, duration, storeId } = req.body;
        const slots = await ReservationService.GetAvailableSlotsOnDate(
            employeeId,
            date,
            storeId,
            duration
        );
        return utils.sendResponse(req, res, slots.success, slots.data, slots.err);
    } catch (error) {
        next(error);
    }
});