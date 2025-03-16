import * as utils from "../utils/utils";
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Reservation, ReservationStatus } from "../entities/Reservation";
import { Employee } from "../entities/Employee";
import { Customer } from "../entities/Customer";
import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { startOfDay, endOfDay, parseISO, format } from "date-fns";
import * as ReservationService from "../services/reservation.service";

const reservationRepository = AppDataSource.getRepository(Reservation);
const employeeRepository = AppDataSource.getRepository(Employee);
const customerRepository = AppDataSource.getRepository(Customer);

export const getAvailableDates = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { employeeId, storeId } = req.query;
		const dates = await ReservationService.GetAvailableDates(employeeId as string, storeId as string);

		return res.status(200).json(dates);
	} catch (error: any) {
		console.error("Controller error fetching shifts:", error);
		return res.status(500).json({ message: error.message || "Internal server error" });
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

export const createReservation = utils.asyncMiddleware(async (req: Request, res: Response) => {
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

		return res.status(201).json(reservation);
	} catch (error) {
		console.error("Error creating reservation:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
});

export const getAllReservations = utils.asyncMiddleware(async (req: Request, res: Response) => {
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

		return res.status(200).json(reservations);
	} catch (error) {
		console.error("Error fetching reservations:", error);
		return res.status(500).json({ message: "Internal server error" });
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
export const getAvailableSlots = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { employeeId, date } = req.query;
		const slots = await ReservationService.GetAvailableSlotsOnDate(employeeId as string, date as string);
		return res.status(200).json(slots);
	} catch (error) {}
});
