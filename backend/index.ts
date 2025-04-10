import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import employeeRoutes from "./routes/employee.routes";
import storeRoutes from "./routes/store.routes";
import storeAnalyticsRoutes from "./routes/analytics.routes";
import availabilityRoutes from "./routes/availability.routes";
import shiftRoutes from "./routes/shift.routes";
import weeklyStatsRoutes from "./routes/weekly-employee-stats.routes";
import googleCalendarRoutes from "./routes/googleCalendar.routes";
import authRoutes from "./routes/auth.routes";
import reservationRoutes from "./routes/reservation.routes";
import weekRoutes from "./routes/week.routes";
import voiceAgentRoutes from "./routes/voice-agent.routes";
import serviceRoutes from "./routes/service.routes";

import { errorHandler } from "./utils/utils";
import { requireStoreId } from "./middleware/auth.middleware";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");

const PORT = process.env.PORT || 8000;

app.use("/api/stores", storeRoutes);
app.use("/api/stores/:storeId/auth", authRoutes);
app.use("/api/stores/:storeId/analytics", requireStoreId, storeAnalyticsRoutes);
app.use("/api/stores/:storeId/voice", requireStoreId, voiceAgentRoutes);
app.use("/api/stores/:storeId/employees", requireStoreId, employeeRoutes);
app.use("/api/stores/:storeId/availability", requireStoreId, availabilityRoutes);
app.use("/api/stores/:storeId/shifts", requireStoreId, shiftRoutes);
app.use("/api/stores/:storeId/weekly-stats", requireStoreId, weeklyStatsRoutes);
app.use("/api/stores/:storeId/google-calendar", requireStoreId, googleCalendarRoutes);
app.use("/api/stores/:storeId/reservations", requireStoreId, reservationRoutes);
app.use("/api/stores/:storeId/week", requireStoreId, weekRoutes);
app.use("/api/stores/:storeId/services", requireStoreId, serviceRoutes);

app.use(errorHandler);

AppDataSource.initialize()
	.then(() => {
		console.log("Data Source has been initialized!");

		// Start server
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	})
	.catch((error) => console.log("Error during Data Source initialization:", error));
