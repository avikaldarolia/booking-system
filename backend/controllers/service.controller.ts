import { NextFunction, Request, Response } from "express";
import * as ServicesService from "../services/services.service";
import * as utils from "../utils/utils";

export const getAllServices = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const storeId = req.storeId!;
		const services = await ServicesService.GetAllServices(storeId);

		return utils.sendResponse(req, res, services.success, services.data, services.err);
	} catch (error) {
		next(error);
	}
});

export const getServiceById = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const storeId = req.storeId!;
		const service = await ServicesService.GetServiceById(req.params.id, storeId);
		return utils.sendResponse(req, res, service.success, service.data, service.err);
	} catch (error) {
		next(error);
	}
});

export const createService = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const newService = await ServicesService.CreateService(req.body);

		return utils.sendResponse(req, res, newService.success, newService.data, newService.err);
	} catch (error) {
		next(error);
	}
});

export const deleteService = utils.asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const deletedStore = await ServicesService.DeleteService(req.params.id);
		if (!deletedStore) {
			return res.status(404).json({ message: "Store not found" });
		}

		return utils.sendResponse(req, res, deletedStore.success, deletedStore.data, deletedStore.err);
	} catch (error) {
		next(error);
	}
});
