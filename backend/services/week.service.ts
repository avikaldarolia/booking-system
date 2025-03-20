import { AppDataSource } from "../data-source";
import { Store } from "../entities/Store";
import { Week } from "../entities/Week";
import * as utils from "../utils/utils";

const weekRepository = AppDataSource.getRepository(Week);
export const FindorCreate = async (startDate: Date, endDate: Date, store: Store) => {
	try {
		let week = await weekRepository.findOne({
			where: {
				startDate,
				endDate,
			},
		});

		if (!week) {
			week = weekRepository.create({
				startDate,
				endDate,
				store,
			});

			await weekRepository.save(week);
		}

		return utils.serviceResponse(true, week, "");
	} catch (error) {
		throw error;
	}
};
