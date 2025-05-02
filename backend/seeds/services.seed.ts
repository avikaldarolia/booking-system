import { DataSource } from "typeorm";
import { Service } from "../entities/Service";
import { Store } from "../entities/Store";
import { AppDataSource } from "../data-source";

// Define the service data interface for better type safety
interface ServiceData {
	name: string;
	price: number;
	duration: number;
	description: string;
}

const seedServices = async (): Promise<void> => {
	try {
		// Initialize the data source
		await AppDataSource.initialize();
		console.log("Database connection established");

		const serviceRepo = AppDataSource.getRepository(Service);
		const storeRepo = AppDataSource.getRepository(Store);

		// Fetch stores with proper error handling
		const stores = await storeRepo.find();
		if (!stores || stores.length === 0) {
			throw new Error("No stores found in the database. Please create a store first.");
		}

		const servicesData: ServiceData[] = [
			{
				name: "Regular Haircut",
				price: 32,
				duration: 30,
				description: "A classic haircut with expert styling to suit your look.",
			},
			{
				name: "Bald, Skin, Razor & Zero Fade",
				price: 37,
				duration: 45,
				description: "A precise fade or full shave with a razor for a clean look.",
			},
			{
				name: "Haircut + Beard Trim",
				price: 50,
				duration: 45,
				description: "A stylish haircut paired with a detailed beard trim for a polished appearance.",
			},
			{
				name: "Beard Colour Enhancement",
				price: 20,
				duration: 30,
				description: "Enhance your beard's color and definition for a sharper look. Price varies based on coverage.",
			},
			{
				name: "Beard Trim",
				price: 22,
				duration: 15,
				description: "A precise trim to shape and maintain your beard’s best look.",
			},
			{
				name: "Simple Brush Cut",
				price: 26,
				duration: 30,
				description: "A quick and easy brush cut for a clean and neat finish.",
			},
			{
				name: "Kids Cut (Age 8+)",
				price: 32,
				duration: 30,
				description: "A stylish and comfortable haircut for kids aged 8 and above.",
			},
			{
				name: "Hair Wash",
				price: 32,
				duration: 10,
				description: "A refreshing hair wash to cleanse and revitalize your scalp.",
			},
		];

		// Create service entities
		const services = servicesData.map((data) => {
			const service = serviceRepo.create({
				name: data.name,
				price: data.price,
				duration: data.duration,
				description: data.description,
				store: stores[0],
			});
			return service;
		});

		// Save all services in a single transaction
		await serviceRepo.save(services);
		console.log("Services seeded successfully");
	} catch (error) {
		console.error("Error seeding services:", error);
		throw error;
	} finally {
		// Ensure the connection is closed even if there's an error
		if (AppDataSource.isInitialized) {
			await AppDataSource.destroy();
			console.log("Database connection closed");
		}
	}
};

// Execute the seeding function
seedServices()
	.then(() => {
		console.log("Seeding completed");
		process.exit(0);
	})
	.catch((error) => {
		console.error("Seeding failed:", error);
		process.exit(1);
	});
