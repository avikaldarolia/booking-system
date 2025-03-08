import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Store } from "./entities/Store";
import { Employee } from "./entities/Employee";
import { Availability } from "./entities/Availability";
import { Shift } from "./entities/Shift";
import { WeeklyStats } from "./entities/WeeklyStats";
import { Reservation } from "./entities/Reservation";
import { Customer } from "./entities/Customer";

dotenv.config();

export const AppDataSource = new DataSource({
	type: "postgres",
	host: process.env.DB_HOST || "localhost",
	port: parseInt(process.env.DB_PORT || "5432"),
	username: process.env.DB_USERNAME || "postgres",
	password: process.env.DB_PASSWORD || "postgres",
	database: process.env.DB_NAME || "booking",
	synchronize: true, // Set to false in production
	logging: process.env.NODE_ENV === "development",
	entities: [Store, Employee, Availability, Shift, WeeklyStats, Reservation, Customer],
	subscribers: [],
	migrations: [],
});
