import { AppDataSource } from "../data-source";
import { Employee, EmployeeType } from "../entities/Employee";
import { Store } from "../entities/Store";
import * as utils from "../utils/utils";

const employeeRepository = AppDataSource.getRepository(Employee);
const storeRepository = AppDataSource.getRepository(Store);

const DEFAULT_BASE_PAY = 17;
const DEFAULT_BASE_HOURS = 20;

/**
 * Get All the employees for a store.
 * @param storeId
 * @returns
 */
export const GetAllEmployees = async (storeId: string) => {
	try {
		let query = employeeRepository.createQueryBuilder("employee").leftJoinAndSelect("employee.store", "store");
		query = query.where("store.id = :storeId", { storeId });

		const employees = utils.parseSafe(await query.getMany());

		return utils.serviceResponse(true, employees, "");
	} catch (error) {
		throw error;
	}
};

/**
 * Get Employee By ID (for a store).
 * @param id
 * @returns
 */
export const GetEmployeeById = async (id: string, storeId: string) => {
	try {
		const employee = utils.parseSafe(await employeeRepository.findOne({ where: { id }, relations: ["store"] }));

		if (!employee) {
			throw new Error(`Employee with id ${id} not found.`);
		}

		return utils.serviceResponse(true, employee, "");
	} catch (error) {
		throw error;
	}
};

/**
 * Creates a new employee
 * @param data
 * @returns
 */
export const CreateEmployee = async (
	storeId: string,
	data: {
		name: string;
		email: string;
		type: EmployeeType;
		maxHours: number;
		hourlyRate: number;
		password: string;
		bio?: string;
		imageUrl?: string;
	}
) => {
	try {
		const store = await storeRepository.findOne({ where: { id: storeId } });

		if (!store) {
			throw new Error("Store not found.");
		}

		if (!data.email || !data.name) {
			throw new Error("Name and Email are required.");
		}

		const employeeExists = await employeeRepository.findOne({
			where: {
				email: data.email,
			},
		});

		if (employeeExists) {
			throw new Error("Employee with this email already exists");
		}

		data.type = data.type ?? EmployeeType.ASSOCIATE;
		data.hourlyRate = data.hourlyRate ?? DEFAULT_BASE_PAY;
		data.maxHours = data.maxHours ?? DEFAULT_BASE_HOURS;
		data.password = `${data.name}-${data.email}`;

		const newEmployee = employeeRepository.create({ ...data, store });

		// Remove password
		await employeeRepository.save(newEmployee);
		const { password: _, ...emp } = newEmployee;

		return utils.serviceResponse(true, emp, "");
	} catch (error) {
		throw error;
	}
};

// DONT PING
export const UpdateEmployee = async (id: string, data: Partial<Employee>) => {
	try {
		const employee = await employeeRepository.findOne({ where: { id }, relations: ["store"] });

		if (!employee) {
			throw new Error(`Employee with id ${id} not found.`);
		}

		if (data.storeId && data.storeId !== employee.storeId) {
			const store = await storeRepository.findOne({ where: { id: data.storeId } });
			if (!store) throw new Error("Store not found.");
			data.store = store;
		}

		employeeRepository.merge(employee, data);
		return await employeeRepository.save(employee);
	} catch (error) {
		console.error(`Error updating employee with id: ${id}`, error);
		throw new Error("Failed to update employee.");
	}
};

export const DeleteEmployee = async (id: string) => {
	try {
		const employee = await employeeRepository.findOne({ where: { id } });
		console.log(employee);

		if (!employee) {
			throw new Error(`Employee with id ${id} not found.`);
		}

		await employeeRepository.softRemove(employee);
		return { message: "Employee deleted successfully." };
	} catch (error) {
		console.error(`Error deleting employee with id: ${id}`, error);
		throw new Error("Failed to delete employee.");
	}
};
