import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Employee } from "../entities/Employee";
import { Customer } from "../entities/Customer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const employeeRepository = AppDataSource.getRepository(Employee);
const customerRepository = AppDataSource.getRepository(Customer);

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;

		// Check employee first
		let user = await employeeRepository.findOne({
			where: { email },
			select: ["id", "name", "email", "password", "type"],
		});

		let role = "employee";

		// If not an employee, check if customer
		if (!user) {
			user = await customerRepository.findOne({
				where: { email },
				select: ["id", "name", "email", "password"],
			});
			role = "customer";
		}

		if (!user) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const isValidPassword = await bcrypt.compare(password, user.password);

		if (!isValidPassword) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const token = jwt.sign(
			{
				id: user.id,
				email: user.email,
				role: role === "employee" ? user.type : role,
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
				role: role === "employee" ? user.type : role,
			},
		});
	} catch (error) {
		console.error("Error during login:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};

export const me = async (req: Request, res: Response) => {
	try {
		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ message: "No token provided" });
		}

		const decoded = jwt.verify(token, JWT_SECRET) as {
			id: string;
			email: string;
			role: string;
		};

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

		res.json({
			...user,
			role: decoded.role,
		});
	} catch (error) {
		console.error("Error fetching user:", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
