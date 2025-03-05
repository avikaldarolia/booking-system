import { endOfWeek, format, startOfWeek } from "date-fns";
import { BarChart2, Calendar, Clock, DollarSign, Users } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const ManagerDashboard = () => {
	const [stats, setStats] = useState({
		totalEmployees: 0,
		weeklyBudget: 0,
		budgetSpent: 0,
		budgetRemaining: 0,
		totalHours: 0,
		shiftsScheduled: 0,
	});

	const [loading, setLoading] = useState(true);

	// console.log(import.meta.env.VITE_STORE_ID);
	const storeId = import.meta.env.VITE_STORE_ID;

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				// For demo purposes, we'll use a fixed store ID
				// const storeId = "1";
				const currentDate = new Date();

				// Fetch store data
				// const storeResponse = await axios.get(`stores/${storeId}`);

				// Fetch employees count
				const employeesResponse = await axios.get(`employees?storeId=${storeId}`);

				console.log("employeesResponse", employeesResponse);

				// Fetch weekly stats
				const weeklyStatsResponse = await axios.get(
					`weekly-stats?storeId=${storeId}&date=${currentDate.toISOString()}`
				);

				// Fetch shifts for the current week
				const weekStart = format(startOfWeek(currentDate), "yyyy-MM-dd");
				const weekEnd = format(endOfWeek(currentDate), "yyyy-MM-dd");
				const shiftsResponse = await axios.get(`shifts?storeId=${storeId}&startDate=${weekStart}&endDate=${weekEnd}`);

				setStats({
					totalEmployees: employeesResponse.data.length,
					weeklyBudget: weeklyStatsResponse.data.budgetAllocated,
					budgetSpent: weeklyStatsResponse.data.totalCost,
					budgetRemaining: weeklyStatsResponse.data.budgetRemaining,
					totalHours: weeklyStatsResponse.data.totalHours,
					shiftsScheduled: shiftsResponse.data.length,
				});

				setLoading(false);
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, [storeId]);

	const currentWeek = () => {
		const now = new Date();
		const weekStart = startOfWeek(now);
		const weekEnd = endOfWeek(now);
		return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
				<div className="flex items-center bg-white px-4 py-2 rounded-lg shadow">
					<Calendar className="h-5 w-5 text-blue-500 mr-2" />
					<span className="text-gray-600">{currentWeek()}</span>
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
							<Users className="h-6 w-6" />
						</div>
						<div>
							<p className="text-gray-500 text-sm">Total Employees</p>
							<p className="text-2xl font-semibold">{stats.totalEmployees}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
							<DollarSign className="h-6 w-6" />
						</div>
						<div>
							<p className="text-gray-500 text-sm">Weekly Budget</p>
							<p className="text-2xl font-semibold">${stats.weeklyBudget}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="p-3 rounded-full bg-yellow-100 text-yellow-500 mr-4">
							<Clock className="h-6 w-6" />
						</div>
						<div>
							<p className="text-gray-500 text-sm">Total Hours</p>
							<p className="text-2xl font-semibold">{stats.totalHours}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center">
						<div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
							<Calendar className="h-6 w-6" />
						</div>
						<div>
							<p className="text-gray-500 text-sm">Shifts Scheduled</p>
							<p className="text-2xl font-semibold">{stats.shiftsScheduled}</p>
						</div>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold mb-4">Budget Overview</h2>
					<div className="mb-4">
						<div className="flex justify-between mb-1">
							<span className="text-gray-600">Spent: ${stats.budgetSpent}</span>
							<span className="text-gray-600">{Math.round((stats.budgetSpent / stats.weeklyBudget) * 100)}%</span>
						</div>
						<div className="w-full bg-gray-200 rounded-full h-2.5">
							<div
								className="bg-blue-500 h-2.5 rounded-full"
								style={{ width: `${(stats.budgetSpent / stats.weeklyBudget) * 100}%` }}></div>
						</div>
					</div>
					<div className="flex justify-between text-sm">
						<div>
							<p className="text-gray-500">Total Budget</p>
							<p className="font-semibold">${stats.weeklyBudget}</p>
						</div>
						<div>
							<p className="text-gray-500">Remaining</p>
							<p className="font-semibold">${stats.budgetRemaining}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
					<div className="grid grid-cols-2 gap-4">
						<button className="flex items-center justify-center p-4 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors">
							<Users className="h-5 w-5 mr-2" />
							<span>Add Employee</span>
						</button>
						<button className="flex items-center justify-center p-4 bg-green-50 text-green-500 rounded-lg hover:bg-green-100 transition-colors">
							<Calendar className="h-5 w-5 mr-2" />
							<span>Create Shift</span>
						</button>
						<button className="flex items-center justify-center p-4 bg-yellow-50 text-yellow-500 rounded-lg hover:bg-yellow-100 transition-colors">
							<BarChart2 className="h-5 w-5 mr-2" />
							<span>View Reports</span>
						</button>
						<button className="flex items-center justify-center p-4 bg-purple-50 text-purple-500 rounded-lg hover:bg-purple-100 transition-colors">
							<Clock className="h-5 w-5 mr-2" />
							<span>Manage Availability</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ManagerDashboard;
