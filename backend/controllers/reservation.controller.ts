import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Reservation, ReservationStatus } from "../entities/Reservation";
import { Employee } from "../entities/Employee";
import { Customer } from "../entities/Customer";
import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { startOfDay, endOfDay, parseISO, format } from "date-fns";

const reservationRepository = AppDataSource.getRepository(Reservation);
const employeeRepository = AppDataSource.getRepository(Employee);
const customerRepository = AppDataSource.getRepository(Customer);

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

export const getAvailableSlots = async (req: Request, res: Response) => {
	try {
		const { employeeId, date, duration } = req.query;

		const employee = await employeeRepository.findOne({
			where: { id: employeeId as string },
			relations: ["store"],
		});

		if (!employee) {
			return res.status(404).json({ message: "Employee not found" });
		}

		const targetDate = parseISO(date as string);

		// Get existing reservations for the day
		const existingReservations = await reservationRepository.find({
			where: {
				employee: { id: employeeId as string },
				date: Between(startOfDay(targetDate), endOfDay(targetDate)),
				status: ReservationStatus.CONFIRMED,
			},
			order: { startTime: "ASC" },
		});

		// Generate available time slots
		const slots = [];
		const slotDuration = parseInt(duration as string) || 60; // Default to 60 minutes

		const [storeOpenHour, storeOpenMinute] = employee.store.openTime.split(":").map(Number);
		const [storeCloseHour, storeCloseMinute] = employee.store.closeTime.split(":").map(Number);

		let currentSlot = new Date(targetDate);
		currentSlot.setHours(storeOpenHour, storeOpenMinute, 0);

		const endTime = new Date(targetDate);
		endTime.setHours(storeCloseHour, storeCloseMinute, 0);

		while (currentSlot < endTime) {
			const slotEnd = new Date(currentSlot);
			slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

			if (slotEnd > endTime) break;

			const isAvailable = !existingReservations.some((reservation) => {
				const reservationStart = new Date(`${reservation.date}T${reservation.startTime}`);
				const reservationEnd = new Date(`${reservation.date}T${reservation.endTime}`);
				return (
					(currentSlot >= reservationStart && currentSlot < reservationEnd) ||
					(slotEnd > reservationStart && slotEnd <= reservationEnd)
				);
			});

			slots.push({
				startTime: format(currentSlot, "HH:mm"),
				endTime: format(slotEnd, "HH:mm"),
				available: isAvailable,
			});

			currentSlot = slotEnd;
		}

		return res.status(200).json(slots);
	} catch (error) {
		console.error("Error fetching available slots:", error);
		return res.status(500).json({ message: "Internal server error" });
	}
};
