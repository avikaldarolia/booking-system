import axios from "axios";
import { addWeeks, endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, DollarSign, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface Employee {
	id: string;
	name: string;
	type: string;
	maxHours: number;
	currentHours: number;
	hourlyRate: number;
}

interface Shift {
	id: string;
	employee: Employee;
	date: string;
	startTime: string;
	endTime: string;
	hours: number;
	cost: number;
	note: string;
	isPublished: boolean;
}

interface WeeklyStats {
	id: string;
	weekStartDate: string;
	weekEndDate: string;
	totalHours: number;
	totalCost: number;
	budgetAllocated: number;
	budgetRemaining: number;
}

const Schedule = () => {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [showAddShift, setShowAddShift] = useState(false);
	const [newShift, setNewShift] = useState({
		employeeId: "",
		date: new Date().toISOString(),
		startTime: "09:00",
		endTime: "17:00",
		note: "",
	});

	const weekStart = startOfWeek(currentDate);
	const weekEnd = endOfWeek(currentDate);
	const storeId = import.meta.env.VITE_STORE_ID;
	useEffect(() => {
		const fetchScheduleData = async () => {
			try {
				// Format dates for API requests
				const weekStart = format(startOfWeek(currentDate), "yyyy-MM-dd");
				const weekEnd = format(endOfWeek(currentDate), "yyyy-MM-dd");
				// const currentDateStr = format(currentDate, "yyyy-MM-dd");

				// Fetch employees
				const employeesResponse = await axios.get(`employees?storeId=${storeId}`);
				setEmployees(employeesResponse.data);

				// Fetch shifts for the week
				const shiftsResponse = await axios.get(`shifts?storeId=${storeId}&startDate=${weekStart}&endDate=${weekEnd}`);
				setShifts(shiftsResponse.data);

				// Fetch weekly stats
				// const weeklyStatsResponse = await axios.get(`weekly-stats?storeId=${storeId}&date=${currentDateStr}`);
				// setWeeklyStats(weeklyStatsResponse.data);

				setLoading(false);
			} catch (error) {
				console.log(error);
			}
		};

		fetchScheduleData();
	}, [currentDate, storeId]);

	const handlePreviousWeek = () => {
		setCurrentDate(subWeeks(currentDate, 1));
	};

	const handleNextWeek = () => {
		setCurrentDate(addWeeks(currentDate, 1));
	};

	const handleAddShift = async () => {
		try {
			const response = await axios.post("shifts", {
				...newShift,
				storeId,
				isPublished: true,
				date: new Date(`${newShift.date}T${newShift.startTime}:00`).toISOString(),
			});

			setShifts([...shifts, response.data]);
			setShowAddShift(false);
			setNewShift({
				employeeId: "",
				date: new Date().toISOString(),
				startTime: "09:00",
				endTime: "17:00",
				note: "",
			});

			// Refresh weekly stats
			// const weeklyStatsResponse = await axios.get(
			// 	`weekly-stats?storeId=${storeId}&date=${format(currentDate, "yyyy-MM-dd")}`
			// );
			// setWeeklyStats(weeklyStatsResponse.data);

			// Refresh employees to get updated hours
			const employeesResponse = await axios.get(`employees?storeId=${storeId}`);
			setEmployees(employeesResponse.data);
		} catch (error) {
			console.error("Error adding shift:", error);
		}
	};

	const handleDeleteShift = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this shift?")) {
			try {
				await axios.delete(`shifts/${id}`);
				setShifts(shifts.filter((shift) => shift.id !== id));

				// Refresh weekly stats
				const weeklyStatsResponse = await axios.get(
					`weekly-stats?storeId=${storeId}&date=${format(currentDate, "yyyy-MM-dd")}`
				);
				setWeeklyStats(weeklyStatsResponse.data);

				// Refresh employees to get updated hours
				const employeesResponse = await axios.get(`employees?storeId=${storeId}`);
				setEmployees(employeesResponse.data);
			} catch (error) {
				console.error("Error deleting shift:", error);
			}
		}
	};

	// Convert shifts to events for BigCalendar
	const events = shifts.map((shift) => {
		console.log(shift.date);
		const shiftDate = new Date(shift.date);

		const [startHours, startMinutes] = shift.startTime.split(":").map(Number);
		const [endHours, endMinutes] = shift.endTime.split(":").map(Number);

		const start = new Date(shiftDate);
		console.log("SD", start);
		start.setHours(startHours, startMinutes, 0);

		const end = new Date(shiftDate);
		end.setHours(endHours, endMinutes, 0);

		return {
			id: shift.id,
			title: `${shift.employee.name} (${shift.employee.type})`,
			start,
			end,
			resource: shift,
		};
	});

	if (loading) {
		return <Spinner />;
	}

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-gray-800">Schedule</h1>
				<div className="flex items-center space-x-2">
					<button onClick={handlePreviousWeek} className="p-2 rounded-full hover:bg-gray-200">
						<ChevronLeft className="h-5 w-5" />
					</button>
					<div className="bg-white px-4 py-2 rounded-lg shadow">
						<CalendarIcon className="h-5 w-5 text-blue-500 inline mr-2" />
						<span>
							{format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
						</span>
					</div>
					<button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-gray-200">
						<ChevronRight className="h-5 w-5" />
					</button>
				</div>
				<button
					onClick={() => setShowAddShift(true)}
					className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
					<Plus className="h-5 w-5 mr-1" />
					Add Shift
				</button>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<div className="lg:col-span-3">
					<div className="bg-white rounded-lg shadow p-4">
						<BigCalendar
							localizer={localizer}
							events={events}
							startAccessor="start"
							endAccessor="end"
							style={{ height: 600 }}
							defaultView="week"
							date={currentDate}
							onNavigate={(date) => setCurrentDate(date)}
							views={["week", "day"]}
							eventPropGetter={(event) => {
								const backgroundColor =
									event.resource.employee.type === "manager"
										? "#8B5CF6" // Purple for managers
										: event.resource.employee.type === "associate"
										? "#3B82F6" // Blue for associates
										: "#10B981"; // Green for part-time

								return { style: { backgroundColor } };
							}}
							components={{
								event: (props) => (
									<div>
										<div className="font-semibold">{props.title}</div>
										<div className="text-xs">
											{format(props.event.start, "h:mm a")} - {format(props.event.end, "h:mm a")}
										</div>
									</div>
								),
							}}
							onSelectEvent={(event) => {
								if (window.confirm(`Do you want to delete this shift for ${event.title}?`)) {
									handleDeleteShift(event.id);
								}
							}}
						/>
					</div>
				</div>

				<div className="space-y-6">
					<div className="bg-white rounded-lg shadow p-4">
						<h2 className="text-lg font-semibold mb-4">Weekly Stats</h2>
						{weeklyStats && (
							<>
								<div className="mb-4">
									<div className="flex justify-between mb-1">
										<span className="text-gray-600">Budget Used</span>
										<span className="text-gray-600">
											{Math.round((weeklyStats.totalCost / weeklyStats.budgetAllocated) * 100)}%
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2.5">
										<div
											className={`h-2.5 rounded-full ${
												weeklyStats.totalCost / weeklyStats.budgetAllocated > 0.8 ? "bg-red-500" : "bg-blue-500"
											}`}
											style={{ width: `${(weeklyStats.totalCost / weeklyStats.budgetAllocated) * 100}%` }}></div>
									</div>
								</div>

								<div className="space-y-2">
									<div className="flex items-center">
										<DollarSign className="h-5 w-5 text-green-500 mr-2" />
										<div>
											<p className="text-gray-500 text-sm">Total Budget</p>
											<p className="font-semibold">${weeklyStats.budgetAllocated}</p>
										</div>
									</div>

									<div className="flex items-center">
										<DollarSign className="h-5 w-5 text-red-500 mr-2" />
										<div>
											<p className="text-gray-500 text-sm">Spent</p>
											<p className="font-semibold">${weeklyStats.totalCost}</p>
										</div>
									</div>

									<div className="flex items-center">
										<DollarSign className="h-5 w-5 text-blue-500 mr-2" />
										<div>
											<p className="text-gray-500 text-sm">Remaining</p>
											<p className="font-semibold">${weeklyStats.budgetRemaining}</p>
										</div>
									</div>

									<div className="flex items-center">
										<Clock className="h-5 w-5 text-purple-500 mr-2" />
										<div>
											<p className="text-gray-500 text-sm">Total Hours</p>
											<p className="font-semibold">{weeklyStats.totalHours} hours</p>
										</div>
									</div>
								</div>
							</>
						)}
					</div>

					<div className="bg-white rounded-lg shadow p-4">
						<h2 className="text-lg font-semibold mb-4">Employee Hours</h2>
						<div className="space-y-4">
							{employees.map((employee) => (
								<div key={employee.id} className="border-b pb-3 last:border-b-0 last:pb-0">
									<div className="flex justify-between items-center mb-1">
										<span className="font-medium">{employee.name}</span>
										<span className="text-sm text-gray-600">
											{employee.currentHours} / {employee.maxHours} hrs
										</span>
									</div>
									<div className="w-full bg-gray-200 rounded-full h-2.5">
										<div
											className={`h-2.5 rounded-full ${
												employee.currentHours / employee.maxHours > 0.8 ? "bg-red-500" : "bg-blue-500"
											}`}
											style={{ width: `${(employee.currentHours / employee.maxHours) * 100}%` }}></div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Add Shift Modal */}
			{showAddShift && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h2 className="text-xl font-bold mb-4">Add New Shift</h2>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Employee</label>
							<select
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={newShift.employeeId}
								onChange={(e) => setNewShift({ ...newShift, employeeId: e.target.value })}>
								<option value="">Select Employee</option>
								{employees.map((employee) => (
									<option key={employee.id} value={employee.id}>
										{employee.name} ({employee.type}) - {employee.currentHours}/{employee.maxHours} hrs
									</option>
								))}
							</select>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
							<input
								type="date"
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={newShift.date}
								onChange={(e) => setNewShift({ ...newShift, date: e.target.value })}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4 mb-4">
							<div>
								<label className="block text-gray-700 text-sm font-bold mb-2">Start Time</label>
								<input
									type="time"
									className="w-full px-3 py-2 border border-gray-300 rounded-md"
									value={newShift.startTime}
									onChange={(e) => setNewShift({ ...newShift, startTime: e.target.value })}
								/>
							</div>

							<div>
								<label className="block text-gray-700 text-sm font-bold mb-2">End Time</label>
								<input
									type="time"
									className="w-full px-3 py-2 border border-gray-300 rounded-md"
									value={newShift.endTime}
									onChange={(e) => setNewShift({ ...newShift, endTime: e.target.value })}
								/>
							</div>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Note (Optional)</label>
							<textarea
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={newShift.note}
								onChange={(e) => setNewShift({ ...newShift, note: e.target.value })}
								placeholder="Add any notes about this shift"
							/>
						</div>

						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setShowAddShift(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
								Cancel
							</button>
							<button
								onClick={handleAddShift}
								className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
								disabled={!newShift.employeeId}>
								Add Shift
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Schedule;
