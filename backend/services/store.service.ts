import { AppDataSource } from "../data-source";
import { Store } from "../entities/Store";

const storeRepository = AppDataSource.getRepository(Store);

export const GetAllStores = async () => {
	try {
		return await storeRepository.find();
	} catch (error) {
		console.error("Error retrieving all stores:", error);
		throw new Error("Failed to retrieve stores");
	}
};

export const GetStoreById = async (id: string) => {
	try {
		return await storeRepository.findOne({ where: { id } });
	} catch (error) {
		console.error(`Error retrieving store with ID ${id}:`, error);
		throw new Error("Failed to retrieve store by ID");
	}
};

export const CreateStore = async (data: Partial<Store>) => {
	try {
		const newStore = storeRepository.create(data);
		return await storeRepository.save(newStore);
	} catch (error) {
		console.error("Error creating store:", error);
		throw new Error("Failed to create store");
	}
};

export const UpdateStore = async (id: string, data: Partial<Store>) => {
	try {
		const store = await storeRepository.findOne({ where: { id } });
		if (!store) return null;

		storeRepository.merge(store, data);
		return await storeRepository.save(store);
	} catch (error) {
		console.error(`Error updating store with ID ${id}:`, error);
		throw new Error("Failed to update store");
	}
};

export const DeleteStore = async (id: string) => {
	try {
		const store = await storeRepository.findOne({ where: { id } });
		if (!store) return null;

		await storeRepository.remove(store);
		return store;
	} catch (error) {
		console.error(`Error deleting store with ID ${id}:`, error);
		throw new Error("Failed to delete store");
	}
};
