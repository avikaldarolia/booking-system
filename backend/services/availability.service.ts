import { AppDataSource } from "../data-source";
import { Availability } from "../entities/Availability";
import { Employee } from "../entities/Employee";

const availabilityRepository = AppDataSource.getRepository(Availability);
const employeeRepository = AppDataSource.getRepository(Employee);

export const GetAvailabilityByEmployee = async (employeeId: string, startDate?: string, endDate?: string) => {
	try {
		const employee = await employeeRepository.findOne({ where: { id: employeeId } });

		if (!employee) {
			throw new Error("Employee not found");
		}

		let query = availabilityRepository
			.createQueryBuilder("availability")
			.leftJoinAndSelect("availability.employee", "employee")
			.where("employee.id = :employeeId", { employeeId });

		if (startDate && endDate) {
			query = query.andWhere("availability.date BETWEEN :startDate AND :endDate", {
				startDate,
				endDate,
			});
		}

		const availabilities = await query.getMany();
		return availabilities;
	} catch (error) {
		console.error("Error in getAvailabilityByEmployee service:", error);
		throw new Error("Internal server error");
	}
};

export const CreateAvailability = async (
	employeeId: string,
	date: string,
	startTime: string,
	endTime: string,
	isBlocked: boolean,
	note: string
) => {
	try {
		const employee = await employeeRepository.findOne({ where: { id: employeeId } });

		if (!employee) {
			throw new Error("Employee not found");
		}

		const newAvailability = availabilityRepository.create({
			employee,
			date,
			startTime,
			endTime,
			isBlocked,
			note,
		});

		await availabilityRepository.save(newAvailability);
		return newAvailability;
	} catch (error) {
		console.error("Error in createAvailability service:", error);
		throw new Error("Internal server error");
	}
};

export const UpdateAvailability = async (
	id: string,
	date: string,
	startTime: string,
	endTime: string,
	isBlocked: boolean,
	note: string
) => {
	try {
		const availability = await availabilityRepository.findOne({ where: { id } });

		if (!availability) {
			throw new Error("Availability not found");
		}

		availabilityRepository.merge(availability, {
			date,
			startTime,
			endTime,
			isBlocked,
			note,
		});

		const updatedAvailability = await availabilityRepository.save(availability);
		return updatedAvailability;
	} catch (error) {
		console.error("Error in updateAvailability service:", error);
		throw new Error("Internal server error");
	}
};

export const DeleteAvailability = async (id: string) => {
	try {
		const availability = await availabilityRepository.findOne({ where: { id } });

		if (!availability) {
			throw new Error("Availability not found");
		}

		await availabilityRepository.remove(availability);
	} catch (error) {
		console.error("Error in deleteAvailability service:", error);
		throw new Error("Internal server error");
	}
};
