import "reflect-metadata";
import express from "express";
// import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import employeeRoutes from "./routes/employee.routes";
import storeRoutes from "./routes/store.routes";
import availabilityRoutes from "./routes/availability.routes";
import shiftRoutes from "./routes/shift.routes";
import weeklyStatsRoutes from "./routes/weeklyStats.routes";
import googleCalendarRoutes from "./routes/googleCalendar.routes";
import authRoutes from "./routes/auth.routes";
import reservationRoutes from "./routes/reservation.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");

const PORT = process.env.PORT || 8000;

app.use("/api/auth", authRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/weekly-stats", weeklyStatsRoutes);
app.use("/api/google-calendar", googleCalendarRoutes);
app.use("/api/reservations", reservationRoutes);

AppDataSource.initialize()
	.then(() => {
		console.log("Data Source has been initialized!");

		// Start server
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	})
	.catch((error) => console.log("Error during Data Source initialization:", error));
