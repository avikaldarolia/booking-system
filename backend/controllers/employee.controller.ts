import { Request, Response } from "express";
import * as EmployeeService from "../services/employee.service";
import * as utils from "../utils/utils";

export const getAllEmployees = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const employees = await EmployeeService.GetAllEmployees(req.query.storeId as string);
		return res.status(200).json(employees);
	} catch (error) {
		console.error("Error in getAllEmployees:", error);
		return res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
	}
});

export const getEmployeeById = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const employee = await EmployeeService.GetEmployeeById(req.params.id);
		if (!employee) {
			return res.status(404).json({ message: "Employee not found" });
		}

		return res.status(200).json(employee);
	} catch (error) {
		console.error("Error in getEmployeeId:", error);
		return res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
	}
});

export const createEmployee = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const newEmployee = await EmployeeService.CreateEmployee(req.body);
		return res.status(201).json(newEmployee);
	} catch (error) {
		console.error("Error in createEmployee:", error);
		return res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
	}
});

export const updateEmployee = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const updatedEmployee = await EmployeeService.UpdateEmployee(req.params.id, req.body);
		return res.status(200).json(updatedEmployee);
	} catch (error) {
		console.error("Error in updateEmployee:", error);
		return res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
	}
});

export const deleteEmployee = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		await EmployeeService.DeleteEmployee(req.params.id);
		return res.status(200).json({ message: "Employee deleted successfully" });
	} catch (error) {
		console.error("Error in deleteEmployee:", error);
		return res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
	}
});

export const resetEmployeeHours = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		await EmployeeService.ResetEmployeeHours(req.params.storeId);
		return res.status(200).json({ message: "Employee hours reset successfully" });
	} catch (error) {
		console.error("Error in resetEmployeeHours:", error);
		return res.status(500).json({ message: error instanceof Error ? error.message : "Internal server error" });
	}
});
