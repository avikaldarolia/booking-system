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

export const getAllReservations = async (req: Request, res: Response) => {
	try {
		const { employeeId, customerId, startDate, endDate, status } = req.query;

		let query = reservationRepository
			.createQueryBuilder("reservation")
			.leftJoinAndSelect("reservation.employee", "employee")
			.leftJoinAndSelect("reservation.customer", "customer");

		if (employeeId) {
			query = query.andWhere("employee.id = :employeeId", { employeeId });
		}

		if (customerId) {
			query = query.andWhere("customer.id = :customerId", { customerId });
		}

		if (startDate && endDate) {
			query = query.andWhere("reservation.date BETWEEN :startDate AND :endDate", {
				startDate,
				endDate,
			});
		}

		if (status) {
			query = query.andWhere("reservation.status = :status", { status });
		}

		const reservations = await query.getMany();
		return res.status(200).json(reservations);
	} catch (error) {
		console.error("Error fetching reservations:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

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

export const createReservation = async (req: Request, res: Response) => {
	try {
		const { employeeId, customerId, date, startTime, endTime, duration, notes } = req.body;

		// Check if employee exists
		const employee = await employeeRepository.findOne({ where: { id: employeeId } });
		if (!employee) {
			return res.status(404).json({ message: "Employee not found" });
		}

		// Check if customer exists
		const customer = await customerRepository.findOne({ where: { id: customerId } });
		if (!customer) {
			return res.status(404).json({ message: "Customer not found" });
		}

		// Check if employee is available
		const reservationDate = new Date(date);
		const existingReservation = await reservationRepository.findOne({
			where: {
				employee: { id: employeeId },
				date: reservationDate,
				startTime: LessThanOrEqual(endTime),
				endTime: MoreThanOrEqual(startTime),
				status: ReservationStatus.CONFIRMED,
			},
		});

		if (existingReservation) {
			return res.status(400).json({
				message: "Employee is not available at this time",
			});
		}

		const newReservation = reservationRepository.create({
			employee,
			customer,
			date: reservationDate,
			startTime,
			endTime,
			duration,
			notes,
			status: ReservationStatus.CONFIRMED,
		});

		await reservationRepository.save(newReservation);
		return res.status(201).json(newReservation);
	} catch (error) {
		console.error("Error creating reservation:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};

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
