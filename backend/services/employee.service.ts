import { AppDataSource } from "../data-source";
import { Employee, EmployeeType } from "../entities/Employee";
import { Store } from "../entities/Store";

const employeeRepository = AppDataSource.getRepository(Employee);
const storeRepository = AppDataSource.getRepository(Store);

export const GetAllEmployees = async (storeId?: string) => {
	try {
		let query = employeeRepository.createQueryBuilder("employee").leftJoinAndSelect("employee.store", "store");

		if (storeId) {
			query = query.where("store.id = :storeId", { storeId });
		}

		return await query.getMany();
	} catch (error) {
		console.error("Error fetching employees:", error);
		throw new Error("Failed to fetch employees from the database.");
	}
};

export const GetEmployeeById = async (id: string) => {
	try {
		const employee = await employeeRepository.findOne({ where: { id }, relations: ["store"] });

		if (!employee) {
			throw new Error(`Employee with id ${id} not found.`);
		}

		return employee;
	} catch (error) {
		console.error(`Error fetching employee with id: ${id}`, error);
		throw new Error("Failed to fetch employee details.");
	}
};

export const CreateEmployee = async (data: {
	name: string;
	email: string;
	type: EmployeeType;
	maxHours: number;
	hourlyRate: number;
	storeId: string;
}) => {
	try {
		const store = await storeRepository.findOne({ where: { id: data.storeId } });

		if (!store) {
			throw new Error("Store not found.");
		}

		const newEmployee = employeeRepository.create({ ...data, store });
		return await employeeRepository.save(newEmployee);
	} catch (error) {
		console.error("Error creating employee:", error);
		throw new Error("Failed to create employee.");
	}
};

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

		if (!employee) {
			throw new Error(`Employee with id ${id} not found.`);
		}

		await employeeRepository.remove(employee);
		return { message: "Employee deleted successfully." };
	} catch (error) {
		console.error(`Error deleting employee with id: ${id}`, error);
		throw new Error("Failed to delete employee.");
	}
};

export const ResetEmployeeHours = async (storeId: string) => {
	try {
		const employees = await employeeRepository.find({ where: { store: { id: storeId } } });

		if (employees.length === 0) {
			throw new Error("No employees found for this store.");
		}

		employees.forEach((emp) => (emp.currentHours = 0));
		await employeeRepository.save(employees);

		return { message: "Employee hours reset successfully." };
	} catch (error) {
		console.error(`Error resetting employee hours for storeId: ${storeId}`, error);
		throw new Error("Failed to reset employee hours.");
	}
};
