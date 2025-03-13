import React, { useState } from "react";
import { format, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
	availableDates: Date[];
	selectedDate: Date | null;
	onSelectDate: (date: Date) => void;
}

const CalendarComponent: React.FC<CalendarProps> = ({ availableDates, selectedDate, onSelectDate }) => {
	const [currentMonth, setCurrentMonth] = useState(() => selectedDate || new Date());

	const year = currentMonth.getFullYear();
	const month = currentMonth.getMonth();
	const firstDay = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	// Generate grid for days
	const grid: (Date | null)[] = [
		...Array.from({ length: firstDay }, () => null),
		...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
	];

	const getDateClasses = (date: Date | null) => {
		if (!date) return "invisible";
		const isAvailable = availableDates.some((availDate) => isSameDay(availDate, date));
		const isSelected = selectedDate && isSameDay(date, selectedDate);
		const isToday = isSameDay(date, new Date());

		return `flex items-center justify-center w-12 h-12 rounded-md font-semibold text-sm transition-all
			${isAvailable ? "cursor-pointer hover:bg-blue-100" : "text-gray-400 cursor-not-allowed"}
			${isSelected ? "bg-blue-500 text-white" : ""}
			${isToday && !isSelected ? "border-2 border-blue-500" : ""}
		`;
	};

	return (
		<div className="max-w-sm mx-auto p-6 bg-white rounded-xl shadow-lg">
			{/* Header with Navigation */}
			<div className="flex justify-between items-center mb-4">
				<button
					onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
					className="p-2 rounded-full hover:bg-gray-200 transition">
					<ChevronLeft className="h-5 w-5" />
				</button>
				<h2 className="text-lg font-bold text-gray-800">{format(currentMonth, "MMMM yyyy")}</h2>
				<button
					onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
					className="p-2 rounded-full hover:bg-gray-200 transition">
					<ChevronRight className="h-5 w-5" />
				</button>
			</div>

			{/* Days of the Week */}
			<div className="grid grid-cols-7 text-center text-sm font-medium text-gray-600 mb-2">
				{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
					<div key={day} className="py-2">
						{day}
					</div>
				))}
			</div>

			{/* Date Grid */}
			<div className="grid grid-cols-7 gap-1">
				{grid.map((date, index) => (
					<div
						key={index}
						className={getDateClasses(date)}
						onClick={() => date && availableDates.some((d) => isSameDay(d, date)) && onSelectDate(date)}>
						{date ? date.getDate() : ""}
					</div>
				))}
			</div>
		</div>
	);
};

export default CalendarComponent;
