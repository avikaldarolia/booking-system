import { addWeeks, endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import Spinner from "../../components/Spinner";
import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight, Clock, DollarSign, Edit, Save } from "lucide-react";
import axios from "axios";
import { WeekStats } from "../../types";

const WeeklyStats = () => {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [stats, setStats] = useState<WeekStats | null>(null);
	const [historyStats, setHistoryStats] = useState<WeekStats[]>([]);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [editedStats, setEditedStats] = useState<{
		budgetAllocated: number;
		notes: string;
	}>({
		budgetAllocated: 0,
		notes: "",
	});

	const weekStart = startOfWeek(currentDate);
	const weekEnd = endOfWeek(currentDate);

	const storeId = import.meta.env.VITE_STORE_ID;

	useEffect(() => {
		const fetchWeeklyStats = async () => {
			try {
				// Fetch current week stats
				const weekStart = format(startOfWeek(currentDate), "yyyy-MM-dd");
				const weekEnd = format(endOfWeek(currentDate), "yyyy-MM-dd");

				const weekResponse = await axios.get(`week?storeId=${storeId}&startDate=${weekStart}&endDate=${weekEnd}`);

				if (weekResponse.data.success) {
					setStats(weekResponse.data.data);
				}

				// Fetch historical stats (last 4 weeks)
				const historyResponse = await axios.get(`week/history?storeId=${storeId}&weeks=4`);

				if (historyResponse.data.success) {
					setHistoryStats(historyResponse.data.data);
				}

				setLoading(false);

				// Initialize edited stats if we have stats
				// if (statsResponse.data) {
				// 	setEditedStats({
				// 		budgetAllocated: statsResponse.data.budgetAllocated,
				// 		notes: statsResponse.data.notes || "",
				// 	});
				// }
			} catch (error) {
				console.error("Error fetching weekly stats:", error);
				setLoading(false);
			}
		};

		fetchWeeklyStats();
	}, [currentDate, storeId]);

	const handlePreviousWeek = () => {
		setCurrentDate(subWeeks(currentDate, 1));
	};

	const handleNextWeek = () => {
		setCurrentDate(addWeeks(currentDate, 1));
	};

	const handleSaveStats = async () => {
		if (!stats) return;

		try {
			const response = await axios.put(`weekly-stats/${stats.id}`, editedStats);
			setStats(response.data);
			setEditing(false);
		} catch (error) {
			console.error("Error updating weekly stats:", error);
			setEditing(false);
		}
	};

	if (loading) {
		return <Spinner />;
	}

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-gray-800">Weekly Stats</h1>
				<div className="flex items-center space-x-2">
					<button onClick={handlePreviousWeek} className="p-2 rounded-full hover:bg-gray-200">
						<ChevronLeft className="h-5 w-5" />
					</button>
					<div className="bg-white px-4 py-2 rounded-lg shadow">
						<Calendar className="h-5 w-5 text-blue-500 inline mr-2" />
						<span>
							{format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
						</span>
					</div>
					<button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-gray-200">
						<ChevronRight className="h-5 w-5" />
					</button>
				</div>
				{editing ? (
					<button
						onClick={handleSaveStats}
						className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center">
						<Save className="h-5 w-5 mr-1" />
						Save Changes
					</button>
				) : (
					<button
						onClick={() => setEditing(true)}
						className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
						<Edit className="h-5 w-5 mr-1" />
						Edit Budget
					</button>
				)}
			</div>

			{stats && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center mb-4">
							<div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
								<DollarSign className="h-6 w-6" />
							</div>
							<div>
								<p className="text-gray-500 text-sm">Weekly Budget</p>
								{editing ? (
									<input
										type="number"
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
										value={editedStats.budgetAllocated}
										onChange={(e) =>
											setEditedStats({
												...editedStats,
												budgetAllocated: parseInt(e.target.value),
											})
										}
									/>
								) : (
									<p className="text-2xl font-semibold">${stats.budget}</p>
								)}
							</div>
						</div>
						<div className="mb-4">
							<div className="flex justify-between mb-1">
								<span className="text-gray-600">Budget Used</span>
								<span className="text-gray-600">{((stats.cost / stats.budget) * 100).toFixed(2)}%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2.5">
								<div
									className={`h-2.5 rounded-full ${stats.cost / stats.budget > 0.8 ? "bg-red-500" : "bg-blue-500"}`}
									style={{ width: `${(stats.cost / stats.budget) * 100}%` }}></div>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center mb-4">
							<div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
								<DollarSign className="h-6 w-6" />
							</div>
							<div>
								<p className="text-gray-500 text-sm">Spent / Remaining</p>
								<p className="text-2xl font-semibold">
									${stats.cost} / ${stats.budget}
								</p>
							</div>
						</div>
						<div className="flex justify-between text-sm">
							<div>
								<p className="text-gray-500">Cost per Hour</p>
								<p className="font-semibold">${stats.hours > 0 ? (stats.cost / stats.hours).toFixed(2) : "0.00"}/hr</p>
							</div>
							<div>
								<p className="text-gray-500">Budget Status</p>
								<p
									className={`font-semibold ${
										stats.budget - stats.cost < 0
											? "text-red-500"
											: stats.budget - stats.cost < stats.budget * 0.2
											? "text-yellow-500"
											: "text-green-500"
									}`}>
									{stats.budget - stats.cost < 0
										? "Over Budget"
										: stats.budget - stats.cost < stats.budget * 0.2
										? "Low Budget"
										: "On Track"}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="flex items-center mb-4">
							<div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
								<Clock className="h-6 w-6" />
							</div>
							<div>
								<p className="text-gray-500 text-sm">Total Hours</p>
								<p className="text-2xl font-semibold">{stats.hours} hours</p>
							</div>
						</div>
						{/* <div className="mb-4">
							<p className="text-gray-500 text-sm mb-2">Notes</p>
							{editing ? (
								<textarea
									className="w-full px-3 py-2 border border-gray-300 rounded-md"
									value={editedStats.notes}
									onChange={(e) =>
										setEditedStats({
											...editedStats,
											notes: e.target.value,
										})
									}
									placeholder="Add notes about this week's budget"
								/>
							) : (
								<p className="text-gray-700">{stats.notes || "No notes for this week."}</p>
							)}
						</div> */}
					</div>
				</div>
			)}

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="p-6 border-b">
					<h2 className="text-xl font-bold text-gray-800 mb-2">Weekly Trends</h2>
					<p className="text-gray-600">Compare budget and hours across recent weeks</p>
				</div>

				<div className="p-6">
					<h3 className="text-lg font-semibold mb-4">Budget Comparison</h3>
					<div className="space-y-4">
						{[...historyStats, stats]
							.filter(Boolean)
							.sort((a, b) => new Date(a!.startDate).getTime() - new Date(b!.endDate).getTime())
							.map((weekStats, index) => (
								<div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
									<div className="flex justify-between items-center mb-1">
										<span className="font-medium">
											{format(new Date(weekStats!.startDate), "MMM d")} -{" "}
											{format(new Date(weekStats!.endDate), "MMM d")}
										</span>
										<span className="text-sm text-gray-600">
											${weekStats!.cost} / ${weekStats!.budget}
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2.5">
										<div
											className={`h-2.5 rounded-full ${
												weekStats!.cost / weekStats!.budget > 0.8 ? "bg-red-500" : "bg-blue-500"
											}`}
											style={{ width: `${(weekStats!.cost / weekStats!.budget) * 100}%` }}></div>
									</div>
									<div className="flex justify-between text-xs text-gray-500 mt-1">
										<span>Hours: {weekStats!.hours}</span>
										<span>{Math.round((weekStats!.cost / weekStats!.budget) * 100)}% of budget</span>
									</div>
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default WeeklyStats;
