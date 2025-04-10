import * as utils from "../utils/utils";
import { AppDataSource } from "../data-source";
import { Service } from "../entities/Service";

const serviceRepository = AppDataSource.getRepository(Service);

export const GetAllServices = async (storeId: string) => {
	try {
		const services = utils.parseSafe(
			await serviceRepository.find({
				where: {
					store: {
						id: storeId,
					},
				},
			})
		);
		return utils.serviceResponse(true, services, "");
	} catch (error) {
		throw error;
	}
};

export const GetServiceById = async (id: string, storeId: string) => {
	try {
		const service = utils.parseSafe(await serviceRepository.findOne({ where: { id, store: { id: storeId } } }));
		return utils.serviceResponse(true, service, "");
	} catch (error) {
		throw error;
	}
};

export const CreateService = async (data: Partial<Service>) => {
	try {
		const service = serviceRepository.create(data);
		const newService = await serviceRepository.save(service);

		return utils.serviceResponse(true, newService, "");
	} catch (error) {
		throw error;
	}
};

export const DeleteService = async (id: string) => {
	try {
		const service = utils.parseSafe(await serviceRepository.findOne({ where: { id } }));
		if (!service) return null;

		const removedService = await serviceRepository.remove(service);
		return utils.serviceResponse(true, removedService, "");
	} catch (error) {
		throw error;
	}
};
