import { Brackets, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../data-source";
import { Shift } from "../entities/Shift";
import { add, format, startOfDay } from "date-fns";
import { Employee } from "../entities/Employee";
import { Reservation, ReservationStatus } from "../entities/Reservation";
import { Customer } from "../entities/Customer";
import { User } from "../types/types";
import * as utils from "../utils/utils";
import { Service } from "../entities/Service";
import { Week } from "../entities/Week";
import { WeeklyEmployeeStats } from "../entities/WeeklyEmployeeStats";

const reservationRepository = AppDataSource.getRepository(Reservation);
const shiftRepository = AppDataSource.getRepository(Shift);
const employeeRepository = AppDataSource.getRepository(Employee);
const customerRepository = AppDataSource.getRepository(Customer);

const DEFAULT_DURATION = 60;

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
	service: Service,
	storeId: string,
	notes: string
) => {
	return utils.runInTransaction<Reservation>(async (queryRunner) => {
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

		const employee: Employee = await queryRunner.manager.getRepository(Employee).findOne({ where: { id: employeeId } });
		if (!employee) {
			throw new Error("Employee not found");
		}

		let customer: Customer = await queryRunner.manager.getRepository(Customer).findOne({ where: { email, phone } });

		let adjustedDate = utils.localeDate(date);
		const adjustDateString = format(adjustedDate, "yyyy-MM-dd");

		console.log("date:", adjustDateString);

		const durationMinutes = service.duration ?? DEFAULT_DURATION;
		const endDateTime = add(new Date(`${adjustDateString}T${startTime}:00`), { minutes: durationMinutes });
		console.log("Calculated end time: ");

		const endTime = format(endDateTime, "HH:mm");

		if (!customer) {
			customer = queryRunner.manager.getRepository(Customer).create({
				email,
				phone,
				name: name || "",
			});

			await customerRepository.save(customer);
		}

		const existingReservations: Reservation[] = await queryRunner.manager.getRepository(Reservation).find({
			where: {
				employee: { id: employeeId },
				date: adjustedDate,
				startTime: LessThan(endTime),
				endTime: MoreThan(startTime),
			},
		});

		if (existingReservations.length > 0) {
			throw new Error("Employee is already booked for this time slot");
		}

		let week: Week = await queryRunner.manager.getRepository(Week).findOne({
			where: {
				startDate: LessThanOrEqual(adjustedDate),
				endDate: MoreThanOrEqual(adjustedDate),
				store: { id: storeId },
			},
		});

		if (!week) {
			throw new Error("Unable to fetch the week.");
		}

		week.revenue = Number(week.revenue) + service.price;

		let employeeStats: WeeklyEmployeeStats = await queryRunner.manager.getRepository(WeeklyEmployeeStats).findOne({
			where: {
				employee: { id: employeeId },
				week: { id: week.id },
				store: { id: storeId },
			},
		});

		if (!employeeStats) {
			throw new Error("Error in employee stats.");
		}

		employeeStats.revenue = Number(employeeStats.revenue) + service.price;

		const reservation = queryRunner.manager.getRepository(Reservation).create({
			employee,
			customer,
			date: adjustedDate,
			startTime,
			endTime,
			duration: durationMinutes,
			notes: notes,
			cost: service.price,
			status: ReservationStatus.CONFIRMED,
			service,
			week,
			store: { id: storeId },
		});

		await queryRunner.manager.getRepository(Reservation).save(reservation);
		await queryRunner.manager.getRepository(Week).save(week);
		await queryRunner.manager.getRepository(WeeklyEmployeeStats).save(employeeStats);

		return reservation;
	});
};

export const GetAvailableDates = async (employeeId: string, storeId: string) => {
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

		query.andWhere("employee.storeId = :storeId", { storeId });
		query.andWhere("shift.date >= :today", { today });

		const result = utils.parseSafe(await query.getMany());
		return utils.serviceResponse(true, result, "");
	} catch (error) {
		throw error;
	}
};

export const GetAvailableSlotsOnDate = async (employeeId: string, date: string, storeId: string, duration: number) => {
	try {
		if (!date) {
			throw new Error("Date is required.");
		}

		const parsedDate = utils.localeDate(date);
		const targetDateString = format(parsedDate, "yyyy-MM-dd");

		const employee = utils.parseSafe(
			await employeeRepository
				.createQueryBuilder("employee")
				.leftJoinAndSelect("employee.shifts", "shift")
				.where("employee.id = :employeeId", { employeeId })
				.andWhere("employee.storeId = :storeId", { storeId })
				.andWhere("DATE(shift.date) = :date", { date: targetDateString })
				.getOne()
		);

		if (!employee || !employee.shifts?.length || !employee.shifts[0]) {
			throw new Error("No shift found.");
		}

		const existingReservations = utils.parseSafe(
			await reservationRepository.find({
				where: {
					employee: { id: employeeId },
					date: parsedDate,
					status: ReservationStatus.CONFIRMED,
				},
				order: { startTime: "ASC" },
			})
		);

		const shiftStartTime = employee.shifts[0].startTime;
		const shiftEndTime = employee.shifts[0].endTime;

		// Generate available time slots
		const slots = [];
		const slotDuration = 30;

		const [shiftOpenHour, shiftOpenMinute] = shiftStartTime.split(":").map(Number);
		const [shiftCloseHour, shiftCloseMinute] = shiftEndTime.split(":").map(Number);

		let currentSlot = new Date(parsedDate);

		currentSlot.setHours(shiftOpenHour, shiftOpenMinute, 0, 0);

		const endTime = parsedDate;
		endTime.setHours(shiftCloseHour, shiftCloseMinute, 0, 0);

		while (currentSlot < endTime) {
			const slotEnd = new Date(currentSlot);
			slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

			if (slotEnd > endTime) break;

			// Check if this slots, end time with the duration of service requested overlaps some reservation or not.
			const slotEndWithService = new Date(currentSlot);
			if (duration) {
				slotEndWithService.setMinutes(slotEndWithService.getMinutes() + Number(duration));
			}

			const isAvailable = !existingReservations.some((reservation: Reservation) => {
				const reservationStart = new Date(`${reservation.date}T${reservation.startTime}`);
				const reservationEnd = new Date(`${reservation.date}T${reservation.endTime}`);
				// return (
				// 	(currentSlot > reservationStart && currentSlot < reservationEnd) ||
				// 	(slotEnd > reservationStart && slotEnd < reservationEnd) ||
				// 	(duration && slotEndWithService > reservationStart && slotEndWithService < reservationEnd)
				// );
				return currentSlot <= reservationEnd && reservationStart <= slotEndWithService;
			});

			slots.push({
				startTime: format(currentSlot, "HH:mm"),
				endTime: format(slotEnd, "HH:mm"),
				available: isAvailable,
			});

			currentSlot = slotEnd;
		}

		return utils.serviceResponse(true, slots, "");
	} catch (error) {
		throw error;
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

		const reservations = utils.parseSafe(await query.getMany());
		return utils.serviceResponse(true, reservations, "");
	} catch (error) {
		throw error;
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
			query.orderBy("reservation.date", "DESC");
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
