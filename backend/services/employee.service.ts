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
	password: string;
}) => {
	try {
		const store = await storeRepository.findOne({ where: { id: data.storeId } });

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
		data.hourlyRate = data.hourlyRate ?? 20;
		data.hourlyRate = data.hourlyRate ?? 10;
		data.password = `${data.name}-${data.email}`;

		// REMOVE PASSWORD BEFORE SEDNING IT BACK.
		const newEmployee = employeeRepository.create({ ...data, store });

		// Remove password
		await employeeRepository.save(newEmployee);
		const { password: _, ...emp } = newEmployee;

		return emp;
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

// DELETE: Availability and shifts first.
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
