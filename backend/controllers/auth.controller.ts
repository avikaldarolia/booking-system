import * as utils from "../utils/utils";
import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Employee } from "../entities/Employee";
import { Customer } from "../entities/Customer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const employeeRepository = AppDataSource.getRepository(Employee);
const customerRepository = AppDataSource.getRepository(Customer);

export const JWT_SECRET = process.env.JWT_SECRET;

interface IJwtPayload {
	id: string;
	email: string;
	role: string;
}

const isEmployee = (role: string) => {
	return role === "associate" || role === "part_time" || role === "manager";
};

export const login = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		// Check employee first
		let user = await employeeRepository.findOne({
			where: { email },
			select: ["id", "name", "email", "password", "type"],
		});

		let role = "associate";

		// If not an employee, check if customer
		if (!user) {
			const customer = await customerRepository.findOne({
				where: { email },
				select: ["id", "name", "email"],
			});
			if (customer) {
				user = customer as any; // Casting to any to avoid type issues
				role = "customer";
			}
		}

		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const isValidPassword = await bcrypt.compare(password, user.password);

		if (!isValidPassword) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		if (!JWT_SECRET) {
			throw new Error("Error fetching secret.");
		}

		const token = jwt.sign(
			{
				id: user.id,
				email: user.email,
				role: user.type ? user.type : role,
			},
			JWT_SECRET,
			{ expiresIn: "24h" }
		);

		// Remove password from response
		const { password: _, ...userWithoutPassword } = user;

		res.json({
			token,
			user: {
				...userWithoutPassword,
				role: role === "associate" || role === "part_time" ? user.type : role,
			},
		});
	} catch (error) {
		console.error("Error during login:", error);
		res.status(500).json({ message: "Internal server error" });
	}
});

export const me = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ message: "No token provided" });
		}

		if (!JWT_SECRET) {
			throw new Error("Error fetching secret.");
		}

		const decoded = jwt.verify(token, JWT_SECRET) as IJwtPayload;

		let user;
		if (decoded.role === "customer") {
			user = await customerRepository.findOne({
				where: { id: decoded.id },
				select: ["id", "name", "email"],
			});
		} else {
			user = await employeeRepository.findOne({
				where: { id: decoded.id },
				select: ["id", "name", "email", "type"],
			});
		}

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		return res.json({
			...user,
			role: decoded.role,
		});
	} catch (error) {
		console.error("Error fetching user:", error);
		res.status(500).json({ message: "Internal server error" });
	}
});
