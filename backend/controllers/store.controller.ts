import { Request, Response } from "express";
import * as StoreService from "../services/store.service";
import * as utils from "../utils/utils"; // Assuming asyncMiddleware exists in utils

export const getAllStores = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const stores = await StoreService.GetAllStores();
		res.status(200).json(stores);
	} catch (error) {
		console.error("Error getting stores:", error);
		res.status(500).json({ message: "Failed to retrieve stores" });
	}
});

export const getStoreById = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const store = await StoreService.GetStoreById(req.params.id);
		if (!store) {
			return res.status(404).json({ message: "Store not found" });
		}
		res.status(200).json(store);
	} catch (error) {
		console.error("Error getting store by ID:", error);
		res.status(500).json({ message: "Failed to retrieve store" });
	}
});

export const createStore = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const newStore = await StoreService.CreateStore(req.body);
		res.status(201).json(newStore);
	} catch (error) {
		console.error("Error creating store:", error);
		res.status(500).json({ message: "Failed to create store" });
	}
});

export const updateStore = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const updatedStore = await StoreService.UpdateStore(req.params.id, req.body);
		if (!updatedStore) {
			return res.status(404).json({ message: "Store not found" });
		}
		res.status(200).json(updatedStore);
	} catch (error) {
		console.error("Error updating store:", error);
		res.status(500).json({ message: "Failed to update store" });
	}
});

export const deleteStore = utils.asyncMiddleware(async (req: Request, res: Response) => {
	try {
		const deletedStore = await StoreService.DeleteStore(req.params.id);
		if (!deletedStore) {
			return res.status(404).json({ message: "Store not found" });
		}
		res.status(200).json({ message: "Store deleted successfully" });
	} catch (error) {
		console.error("Error deleting store:", error);
		res.status(500).json({ message: "Failed to delete store" });
	}
});
