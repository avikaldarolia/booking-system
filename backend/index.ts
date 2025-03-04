import "reflect-metadata";
import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source";
import employeeRoutes from "./routes/employee.routes";
import storeRoutes from "./routes/store.routes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");

const PORT = process.env.PORT || 8000;

app.use("/api/store", storeRoutes);
app.use("/api/employee", employeeRoutes);

AppDataSource.initialize()
	.then(() => {
		console.log("Data Source has been initialized!");

		// Start server
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	})
	.catch((error) => console.log("Error during Data Source initialization:", error));
