import { Between, Brackets, LessThanOrEqual, MoreThanOrEqual, Raw } from "typeorm";
import { AppDataSource } from "../data-source";
import { Shift } from "../entities/Shift";
import { add, Duration, endOfDay, format, parseISO, startOfDay } from "date-fns";
import { Employee } from "../entities/Employee";
import { Reservation, ReservationStatus } from "../entities/Reservation";
import { Customer } from "../entities/Customer";
import { User } from "../types/types";

const reservationRepository = AppDataSource.getRepository(Reservation);
const shiftRepository = AppDataSource.getRepository(Shift);
const employeeRepository = AppDataSource.getRepository(Employee);
const customerRepository = AppDataSource.getRepository(Customer);

interface AuthenticatedUser {
	id: string;
	role: "manager" | "part_time" | "associate" | "customer";
}

export const CreateReservation = async (
	employeeId: string,
	name: string | null,
	email: string,
	phone: string,
	date: string,
	startTime: string,
	duration: string,
	notes: string
) => {
	try {
		// Email and phone number regex check.
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation
		const phoneRegex = /^\d{3}-\d{3}-\d{4}$/; // Format: XXX-XXX-XXXX

		if (!emailRegex.test(email)) {
			throw new Error("Invalid email format");
		}
		if (!phoneRegex.test(phone)) {
			console.log(phone);

			throw new Error("Invalid phone number format (expected: XXX-XXX-XXXX)");
		}

		const employee = await employeeRepository.findOne({ where: { id: employeeId } });
		if (!employee) {
			throw new Error("Employee not found");
		}

		let customer = await customerRepository.findOne({ where: { email, phone } });

		const startDateTime = new Date(`${date}T${startTime}:00`);
		const durationMinutes = parseInt(duration, 10);

		const endDateTime = add(startDateTime, { minutes: durationMinutes });
		const endTime = format(endDateTime, "HH:mm");

		if (!customer) {
			customer = customerRepository.create({
				email,
				phone,
				name: name || "",
			});

			await customerRepository.save(customer);
		}

		const existingReservations = await reservationRepository.find({
			where: {
				employee: { id: employeeId },
				date: startDateTime,
				startTime: LessThanOrEqual(endTime),
				endTime: MoreThanOrEqual(startTime),
			},
		});

		if (existingReservations.length > 0) {
			throw new Error("Employee is already booked for this time slot");
		}
		const reservation = reservationRepository.create({
			employee,
			customer,
			date: startDateTime,
			startTime,
			endTime,
			duration: durationMinutes,
			notes: notes,
			status: ReservationStatus.CONFIRMED,
		});

		await reservationRepository.save(reservation);

		return reservation;
	} catch (error) {
		console.error("Error creating reservation:", error);
		throw new Error(`Failed to create reservation: ${error instanceof Error && error.message}`);
	}
};

export const GetAvailableDates = async (employeeId: string, storeId?: string) => {
	try {
		if (!employeeId) {
			throw new Error("Employee Id is required.");
		}

		const employee = await employeeRepository.findOne({
			where: { id: employeeId as string },
			relations: ["store"],
		});

		if (!employee) {
			throw new Error("Employee not found");
		}

		const today = format(new Date(), "yyyy-MM-dd");
		let query = shiftRepository.createQueryBuilder("shift").leftJoinAndSelect("shift.employee", "employee");

		if (employeeId) {
			query = query.andWhere("employee.id = :employeeId", { employeeId });
		}

		query.andWhere("shift.date >= :today", { today });

		return await query.getMany();
	} catch (error) {
		throw new Error(`Failed to fetch shift: ${error instanceof Error && error.message}`);
	}
};

export const GetAvailableSlotsOnDate = async (employeeId: string, date: string) => {
	try {
		const employee = await employeeRepository
			.createQueryBuilder("employee")
			.leftJoinAndSelect("employee.shifts", "shift")
			.where("employee.id = :employeeId", { employeeId })
			.andWhere("DATE(shift.date) = :date", { date: date.split("T")[0] })
			.getOne();

		if (!employee) {
			throw new Error("Employee not found");
		}

		if (!employee.shifts.length || !employee.shifts[0]) {
			throw new Error("No shift found.");
		}

		// Using the shift date
		const targetDate = employee.shifts[0].date;

		const existingReservations = await reservationRepository.find({
			where: {
				employee: { id: employeeId },
				date: targetDate,
				status: ReservationStatus.CONFIRMED,
			},
			order: { startTime: "ASC" },
		});

		const shiftStartTime = employee.shifts[0].startTime;
		const shiftEndTime = employee.shifts[0].endTime;

		// Generate available time slots
		const slots = [];
		const slotDuration = 30;

		const [shiftOpenHour, shiftOpenMinute] = shiftStartTime.split(":").map(Number);
		const [shiftCloseHour, shiftCloseMinute] = shiftEndTime.split(":").map(Number);

		let currentSlot = new Date(targetDate);
		currentSlot.setHours(shiftOpenHour, shiftOpenMinute, 0);

		const endTime = new Date(targetDate);
		endTime.setHours(shiftCloseHour, shiftCloseMinute, 0);

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

		return slots;
	} catch (error) {
		throw new Error(`Failed to get available slots: ${error instanceof Error && error.message}`);
	}
};

export const GetReservations = async (
	employeeId: string,
	customerId: string,
	user: User,
	startDate: string,
	endDate: string,
	status: ReservationStatus
) => {
	try {
		const query = buildReservationQuery(employeeId, customerId, user, startDate, endDate, status);

		const reservations = query.getMany();
		return reservations;
	} catch (error) {
		throw new Error(`Failed to fetch shift: ${error instanceof Error && error.message}`);
	}
};

/**
 * Function to build the reservation query dynamically based on user role.
 */
const buildReservationQuery = (
	employeeId: string | undefined,
	customerId: string | undefined,
	user: User,
	startDate: string | undefined,
	endDate: string | undefined,
	status: ReservationStatus | undefined
) => {
	let query = reservationRepository
		.createQueryBuilder("reservation")
		.leftJoinAndSelect("reservation.employee", "employee")
		.leftJoinAndSelect("reservation.customer", "customer");

	// Define role-based query modifications
	const roleHandlers: Record<AuthenticatedUser["role"], () => void> = {
		manager: () => {
			if (employeeId) query.andWhere("employee.id = :employeeId", { employeeId });
			if (customerId) query.andWhere("customer.id = :customerId", { customerId });

			if (startDate || endDate) {
				query.andWhere(
					new Brackets((qb) => {
						if (startDate) qb.andWhere("reservation.date >= :startDate", { startDate });
						if (endDate) qb.andWhere("reservation.date <= :endDate", { endDate });
					})
				);
			}

			if (status) query.andWhere("reservation.status = :status", { status });
		},

		part_time: employeeHandler,
		associate: employeeHandler,

		customer: () => {
			if (!user.id) {
				throw new Error("Customer ID is required.");
			}
			query.andWhere("customer.id = :id", { id: user.id });

			if (startDate || endDate) {
				query.andWhere(
					new Brackets((qb) => {
						if (startDate) qb.andWhere("reservation.date >= :startDate", { startDate });
						if (endDate) qb.andWhere("reservation.date <= :endDate", { endDate });
					})
				);
			}
		},
	};

	// Employee handler function
	function employeeHandler() {
		if (!user.id) {
			throw new Error("Employee ID is required.");
		}
		query.andWhere("employee.id = :id", { id: user.id });

		if (startDate || endDate) {
			query.andWhere(
				new Brackets((qb) => {
					if (startDate) qb.andWhere("reservation.date >= :startDate", { startDate });
					if (endDate) qb.andWhere("reservation.date <= :endDate", { endDate });
				})
			);
		}

		if (status) query.andWhere("reservation.status = :status", { status });
	}

	// Execute role-based query logic
	roleHandlers[user.role as keyof typeof roleHandlers]();

	return query;
};
