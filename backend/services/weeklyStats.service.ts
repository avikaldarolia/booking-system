import { AppDataSource } from "../data-source";
import { WeeklyStats } from "../entities/WeeklyStats";
import { Store } from "../entities/Store";
import { Between } from "typeorm";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";
import * as utils from "../utils/utils";

const weeklyStatsRepository = AppDataSource.getRepository(WeeklyStats);
const storeRepository = AppDataSource.getRepository(Store);

export const GetWeeklyStats = async (storeId: string, weekId: string) => {
	try {
		let stats;

		if (!weekId) {
			throw new Error("Week id is required.");
		}

		stats = utils.parseSafe(
			await weeklyStatsRepository.find({
				where: {
					week: { id: weekId },
					store: { id: storeId },
				},
				relations: ["employee"],
			})
		);
		return utils.serviceResponse(true, stats, "");
	} catch (error) {
		throw error;
	}
};

export const UpdateWeeklyStats = async (id: string, budgetAllocated: number, notes: string) => {
	try {
		const weeklyStats = await weeklyStatsRepository.findOne({ where: { id } });

		if (!weeklyStats) {
			throw new Error("Weekly stats not found");
		}

		// Calculate new budget remaining
		const budgetDiff = Number(budgetAllocated) - Number(weeklyStats.budgetAllocated);
		const newBudgetRemaining = Number(weeklyStats.budgetRemaining) + budgetDiff;

		weeklyStatsRepository.merge(weeklyStats, {
			budgetAllocated,
			budgetRemaining: newBudgetRemaining,
			notes,
		});

		const updatedStats = await weeklyStatsRepository.save(weeklyStats);
		return updatedStats;
	} catch (error) {
		console.error("Error in updateWeeklyStats service:", error);
		throw new Error("Internal server error");
	}
};

export const GetWeeklyStatsHistory = async (storeId: string, weeks: string) => {
	try {
		const numWeeks = weeks ? parseInt(weeks) : 4;
		const currentDate = new Date();
		const endDate = endOfWeek(currentDate);
		const startDate = startOfWeek(subWeeks(currentDate, numWeeks - 1));

		const weeklyStats = await weeklyStatsRepository.find({
			where: {
				store: { id: storeId },
				weekStartDate: Between(startDate, endDate),
			},
			order: {
				weekStartDate: "ASC",
			},
			relations: ["store"],
		});

		return weeklyStats;
	} catch (error) {
		console.error("Error in getWeeklyStatsHistory service:", error);
		throw new Error("Internal server error");
	}
};
