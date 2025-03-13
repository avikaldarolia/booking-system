import { Between, Raw } from "typeorm";
import { AppDataSource } from "../data-source";
import { Shift } from "../entities/Shift";
import { endOfDay, format, parseISO, startOfDay } from "date-fns";
import { Employee } from "../entities/Employee";
import { Reservation, ReservationStatus } from "../entities/Reservation";

const reservationRepository = AppDataSource.getRepository(Reservation);
const shiftRepository = AppDataSource.getRepository(Shift);
const employeeRepository = AppDataSource.getRepository(Employee);

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

		if (!employee.shifts) {
			throw new Error("No shift found.");
		}

		const targetDate = format(date, "yyyy-MM-dd");
		const existingReservations = await reservationRepository.find({
			where: {
				employee: { id: employeeId },
				date: Between(startOfDay(date), endOfDay(targetDate)),
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
		throw new Error(`Failed to fetch shift: ${error instanceof Error && error.message}`);
	}
};
