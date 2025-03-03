import "reflect-metadata";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { AppDataSource } from "./data-source";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");

const PORT = process.env.PORT;

AppDataSource.initialize()
	.then(() => {
		console.log("Data Source has been initialized!");

		// Start server
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	})
	.catch((error) => console.log("Error during Data Source initialization:", error));
