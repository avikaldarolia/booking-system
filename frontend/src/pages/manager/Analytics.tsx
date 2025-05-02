import React, { useState, useEffect } from "react";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import axios from "axios";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#d0ed57"];

const Analytics: React.FC = () => {
	// const storeId = "1"; // Replace with dynamic store ID
	const [dateRange, setDateRange] = useState({ startDate: "2025-03-01", endDate: "2025-03-31" });
	const [data, setData] = useState<any>({});

	useEffect(() => {
		fetchAnalytics();
	}, [dateRange]);

	const fetchAnalytics = async () => {
		// const baseUrl = `http://localhost:8000/stores/${storeId}/analytics`;
		const params = { startDate: dateRange.startDate, endDate: dateRange.endDate };
		const endpoints = [
			"revenue/total",
			"revenue/weekly",
			"revenue-cost",
			"revenue/employee",
			"revenue/shift",
			"hourly-rate-effectiveness",
			"employee-utilization",
			"hours-worked",
			"shifts-vs-reservations",
			"reservation-duration",
			"top-employees",
			"employee-no-show",
			"reservation-fulfillment",
			"shift-cost",
			"weekly-trends",
			"booking-trends",
			"reservation-status",
			"shift-overlaps",
			"peak-times",
		];

		const responses = await Promise.all(endpoints.map((ep) => axios.get(`analytics/${ep}`, { params })));
		const newData = endpoints.reduce((acc, ep, idx) => ({ ...acc, [ep]: responses[idx].data }), {});
		setData(newData);
	};

	const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setDateRange({ ...dateRange, [e.target.name]: e.target.value });
	};

	return (
		<div className="p-4">
			<h1 className="text-2xl mb-4">Store Analytics</h1>
			<div className="mb-6">
				<label>Start Date: </label>
				<input type="date" name="startDate" value={dateRange.startDate} onChange={handleDateChange} />
				<label className="ml-4">End Date: </label>
				<input type="date" name="endDate" value={dateRange.endDate} onChange={handleDateChange} />
			</div>

			{/* Revenue and Financials */}
			<h2 className="text-xl mb-2">Total Revenue: ${data["revenue/total"]?.totalRevenue || 0}</h2>
			<h2 className="text-xl mb-2">Revenue Per Week</h2>
			<ResponsiveContainer width="100%" height={300}>
				<LineChart data={data["revenue/weekly"]?.data}>
					<XAxis dataKey="weekStart" />
					<YAxis />
					<Tooltip />
					<Line type="monotone" dataKey="revenue" stroke="#8884d8" />
				</LineChart>
			</ResponsiveContainer>

			<h2 className="text-xl mb-2 mt-6">Revenue vs. Cost</h2>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={data["revenue-cost"]?.data}>
					<XAxis dataKey="weekStart" />
					<YAxis />
					<Tooltip />
					<Bar dataKey="revenue" fill="#8884d8" />
					<Bar dataKey="cost" fill="#ff7300" />
				</BarChart>
			</ResponsiveContainer>

			<h2 className="text-xl mb-2 mt-6">Revenue Per Employee</h2>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={data["revenue/employee"]?.data}>
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<Bar dataKey="revenue" fill="#82ca9d" />
				</BarChart>
			</ResponsiveContainer>

			<h2 className="text-xl mb-2 mt-6">Avg. Revenue per Shift</h2>
			<ResponsiveContainer width="100%" height={300}>
				<LineChart data={data["revenue/shift"]?.data}>
					<XAxis dataKey="weekStart" />
					<YAxis />
					<Tooltip />
					<Line type="monotone" dataKey="avgRevenue" stroke="#8884d8" />
				</LineChart>
			</ResponsiveContainer>

			<h2 className="text-xl mb-2 mt-6">Hourly Rate Effectiveness</h2>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={data["hourly-rate-effectiveness"]?.data}>
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<Bar dataKey="hourlyRate" fill="#ffc658" />
					<Bar dataKey="revenue" fill="#82ca9d" />
				</BarChart>
			</ResponsiveContainer>

			{/* Time Utilization and Efficiency */}
			<h2 className="text-xl mb-2 mt-6">Employee Utilization Rate</h2>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={data["employee-utilization"]?.data}>
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<Bar dataKey="hoursWorked" fill="#82ca9d" />
					<Bar dataKey="maxHours" fill="#ffc658" />
				</BarChart>
			</ResponsiveContainer>

			<h2 className="text-xl mb-2 mt-6">Total Hours Worked: {data["hours-worked"]?.totalHours || 0}</h2>

			<h2 className="text-xl mb-2 mt-6">Shifts vs. Reservations</h2>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={data["shifts-vs-reservations"]?.data}>
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />
					<Bar dataKey="shiftCount" fill="#8884d8" />
					<Bar dataKey="reservationCount" fill="#82ca9d" />
				</BarChart>
			</ResponsiveContainer>

			<h2 className="text-xl mb-2 mt-6">
				Avg. Reservation Duration: {data["reservation-duration"]?.avgDuration || 0} mins
			</h2>

			{/* Employee Performance */}
			<h2 className="text-xl mb-2 mt-6">Top Performing Employees (Revenue)</h2>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={data["top-employees"]?.data}>
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<Bar dataKey="value" fill="#82ca9d" />
				</BarChart>
			</ResponsiveContainer>

			<h2 className="text-xl mb-2 mt-6">Employee No-Show Rate</h2>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={data["employee-no-show"]?.data}>
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<Bar dataKey="noShowRate" fill="#ff7300" />
				</BarChart>
			</ResponsiveContainer>

			<h2 className="text-xl mb-2 mt-6">
				Reservation Fulfillment Rate: {(data["reservation-fulfillment"]?.fulfillmentRate * 100 || 0).toFixed(2)}%
			</h2>

			<h2 className="text-xl mb-2 mt-6">Shift Cost per Employee</h2>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={data["shift-cost"]?.data}>
					<XAxis dataKey="name" />
					<YAxis />
					<Tooltip />
					<Bar dataKey="totalCost" fill="#8884d8" />
				</BarChart>
			</ResponsiveContainer>

			{/* Trends and Comparison */}
			<h2 className="text-xl mb-2 mt-6">Weekly Trends</h2>
			<ResponsiveContainer width="100%" height={300}>
				<LineChart data={data["weekly-trends"]?.data}>
					<XAxis dataKey="weekStart" />
					<YAxis />
					<Tooltip />
					<Line type="monotone" dataKey="revenue" stroke="#8884d8" />
					<Line type="monotone" dataKey="cost" stroke="#ff7300" />
					<Line type="monotone" dataKey="hours" stroke="#82ca9d" />
				</LineChart>
			</ResponsiveContainer>

			<h2 className="text-xl mb-2 mt-6">Booking Trends</h2>
			<ResponsiveContainer width="100%" height={300}>
				<LineChart data={data["booking-trends"]?.data}>
					<XAxis dataKey="date" />
					<YAxis />
					<Tooltip />
					<Line type="monotone" dataKey="count" stroke="#8884d8" />
				</LineChart>
			</ResponsiveContainer>

			<h2 className="text-xl mb-2 mt-6">Reservation Status Breakdown</h2>
			<ResponsiveContainer width="100%" height={300}>
				<PieChart>
					<Pie
						data={data["reservation-status"]?.data}
						dataKey="count"
						nameKey="status"
						cx="50%"
						cy="50%"
						outerRadius={80}
						label>
						{data["reservation-status"]?.data?.map((_: any, index: number) => (
							<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
						))}
					</Pie>
					<Tooltip />
				</PieChart>
			</ResponsiveContainer>

			{/* Scheduling Efficiency */}
			<h2 className="text-xl mb-2 mt-6">Shift Overlaps: {data["shift-overlaps"]?.overlapCount || 0}</h2>

			<h2 className="text-xl mb-2 mt-6">Peak Booking Times</h2>
			<ResponsiveContainer width="100%" height={300}>
				<BarChart data={data["peak-times"]?.data}>
					<XAxis dataKey="hour" />
					<YAxis />
					<Tooltip />
					<Bar dataKey="count" fill="#82ca9d" />
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

export default Analytics;
