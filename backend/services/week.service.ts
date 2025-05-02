import { endOfWeek, startOfWeek, subDays, subWeeks } from "date-fns";
import { AppDataSource } from "../data-source";
import { Store } from "../entities/Store";
import { Week } from "../entities/Week";
import * as utils from "../utils/utils";
import { Between, LessThanOrEqual, MoreThanOrEqual } from "typeorm";

const weekRepository = AppDataSource.getRepository(Week);

export const FindByDate = async (date: string, storeId: string) => {
	try {
		const targetDate = utils.localeDate(date);
		const week = utils.parseSafe(
			await weekRepository.findOne({
				where: {
					startDate: LessThanOrEqual(targetDate),
					endDate: MoreThanOrEqual(targetDate),
					store: { id: storeId },
				},
			})
		);

		return utils.serviceResponse(true, week, "");
	} catch (error) {
		throw error;
	}
};

export const GetWeekDetails = async (startDate: string, endDate: string, storeId: string) => {
	try {
		const begin = utils.localeDate(startDate);
		const end = utils.localeDate(endDate);

		let week = await weekRepository.findOne({
			where: {
				startDate: begin,
				endDate: end,
				store: { id: storeId },
			},
		});

		return utils.serviceResponse(true, week, "");
	} catch (error) {
		throw error;
	}
};

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

export const GetWeekStatsHistory = async (storeId: string, weeks: string) => {
	try {
		if (!storeId) {
			throw new Error("Store Id is required.");
		}
		const numWeeks = weeks ? parseInt(weeks) : 4;
		const currentDate = new Date();
		const endDate = startOfWeek(currentDate);
		const startDate = startOfWeek(subWeeks(currentDate, numWeeks - 1));

		console.log(startDate, endDate);

		const weeklyStats = await weekRepository.find({
			where: {
				store: { id: storeId },
				startDate: Between(startDate, endDate),
			},
			order: {
				startDate: "ASC",
			},
		});

		return utils.serviceResponse(true, weeklyStats, "");
	} catch (error) {
		throw error;
	}
};
