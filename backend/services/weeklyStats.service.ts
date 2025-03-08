import { AppDataSource } from "../data-source";
import { WeeklyStats } from "../entities/WeeklyStats";
import { Store } from "../entities/Store";
import { Between } from "typeorm";
import { startOfWeek, endOfWeek, subWeeks } from "date-fns";

const weeklyStatsRepository = AppDataSource.getRepository(WeeklyStats);
const storeRepository = AppDataSource.getRepository(Store);

export const GetWeeklyStats = async (storeId: string, date: string) => {
	try {
		const targetDate = date ? new Date(date) : new Date();
		const weekStart = startOfWeek(targetDate);
		const weekEnd = endOfWeek(targetDate);

		let weeklyStats = await weeklyStatsRepository.findOne({
			where: {
				store: { id: storeId },
				weekStartDate: Between(weekStart, weekEnd),
			},
			relations: ["store"],
		});

		// If no stats exist for this week, create a new entry
		if (!weeklyStats) {
			const store = await storeRepository.findOne({ where: { id: storeId } });

			if (!store) {
				throw new Error("Store not found");
			}

			weeklyStats = weeklyStatsRepository.create({
				store,
				weekStartDate: weekStart,
				weekEndDate: weekEnd,
				budgetAllocated: store.weeklyBudget,
				budgetRemaining: store.weeklyBudget,
				totalHours: 0,
				totalCost: 0,
			});

			await weeklyStatsRepository.save(weeklyStats);
		}

		return weeklyStats;
	} catch (error) {
		console.error("Error in getWeeklyStats service:", error);
		throw new Error("Internal server error");
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
