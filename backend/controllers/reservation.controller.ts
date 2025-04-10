import * as utils from "../utils/utils";
import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Reservation, ReservationStatus } from "../entities/Reservation";
import * as ReservationService from "../services/reservation.service";

const reservationRepository = AppDataSource.getRepository(Reservation);

export const getAvailableDates = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { employeeId } = req.query;
		const storeId = req.storeId!;
		const dates = await ReservationService.GetAvailableDates(employeeId as string, storeId);

		return utils.sendResponse(req, res, dates.success, dates.data, dates.err);
	} catch (error) {
		next(error);
	}
});

export const getReservationById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
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
};

export const createReservation = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { employeeId, name, email, phone, date, startTime, duration, notes } = req.body;

		const reservation = await ReservationService.CreateReservation(
			employeeId,
			name,
			email,
			phone,
			date,
			startTime,
			duration,
			notes
		);

		return utils.sendResponse(req, res, reservation.success, reservation.data, reservation.err);
	} catch (error) {
		next(error);
	}
});

export const getAllReservations = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { employeeId, customerId, startDate, endDate, status } = req.query;
		const user = req.user;

		if (!user || !user.role) {
			return res.status(401).json({ message: "Unauthorized: User not authenticated" });
		}

		const reservations = await ReservationService.GetReservations(
			employeeId as string,
			customerId as string,
			user,
			startDate as string,
			endDate as string,
			status as ReservationStatus
		);

		return utils.sendResponse(req, res, reservations.success, reservations.data, reservations.err);
	} catch (error) {
		next(error);
	}
});

export const updateReservationStatus = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { status } = req.body;

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
};

export const cancelReservation = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
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
};

/**
 * Get Available slots for an employee on a selected date.
 */
export const getAvailableSlots = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { employeeId, date, duration } = req.query;
		const storeId = req.storeId!;
		const slots = await ReservationService.GetAvailableSlotsOnDate(
			employeeId as string,
			date as string,
			storeId,
			duration as string
		);
		return utils.sendResponse(req, res, slots.success, slots.data, slots.err);
	} catch (error) {
		next(error);
	}
});
