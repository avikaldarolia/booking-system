import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { ChevronLeft } from "lucide-react";
import { Employee, Shift, TimeSlot } from "../../../types";
import CalendarComponent from "../../../components/CustomCalendar";

interface BookingCalendarProps {
	selectedEmployee: Employee;
	selectedDuration: number;
	onBack: () => void;
	onBookAppointment: (selectedSlot: string, notes: string, selectedDate: Date) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
	selectedEmployee,
	selectedDuration,
	onBack,
	onBookAppointment,
}) => {
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
	const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
	const [notes, setNotes] = useState("");
	const [availableShiftDates, setAvailableShiftDates] = useState<Date[]>([]);

	useEffect(() => {
		const fetchAvailableShiftDates = async () => {
			try {
				const response = await axios.get("reservations/dates", {
					params: { employeeId: selectedEmployee.id },
				});
				const shiftDates: Date[] = response.data.map((shift: Shift) => new Date(shift.date));
				setAvailableShiftDates(shiftDates);
			} catch (error) {
				console.error("Error fetching available shift dates:", error);
			}
		};
		fetchAvailableShiftDates();
	}, [selectedEmployee]);

	useEffect(() => {
		const fetchAvailableSlots = async () => {
			if (!selectedDate) return;
			try {
				const response = await axios.get("reservations/slots", {
					params: {
						employeeId: selectedEmployee.id,
						date: format(selectedDate, "yyyy-MM-dd"),
						duration: selectedDuration,
					},
				});
				setAvailableSlots(response.data);
			} catch (error) {
				console.error("Error fetching available slots:", error);
			}
		};
		fetchAvailableSlots();
	}, [selectedDate, selectedDuration, selectedEmployee]);

	return (
		<div className="max-w-5xl mx-auto">
			<div className="flex items-center mb-12">
				<button onClick={onBack} className="mr-4 text-blue-500 hover:text-blue-600">
					<ChevronLeft className="h-6 w-6" />
				</button>
				<h2 className="text-3xl font-bold text-gray-800">Book with {selectedEmployee.name}</h2>
			</div>
			<div className="bg-white rounded-xl shadow-lg p-8">
				<div className="grid md:grid-cols-2 gap-8">
					<div>
						<label className="block text-gray-700 text-sm font-semibold mb-3">Select Date</label>
						<CalendarComponent
							availableDates={availableShiftDates}
							selectedDate={selectedDate}
							onSelectDate={setSelectedDate}
						/>
					</div>

					<div className="space-y-6">
						{selectedDate && (
							<div className="mb-4">
								<p className="text-gray-700 font-semibold">Selected Date: {format(selectedDate, "MMMM d, yyyy")}</p>
							</div>
						)}
						<div>
							<label className="block text-gray-700 text-sm font-semibold mb-3">Available Time Slots</label>
							<div className="grid grid-cols-2 gap-3">
								{availableSlots.map((slot, index) => (
									<button
										key={index}
										className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
											slot.available
												? selectedSlot === slot.startTime
													? "bg-blue-500 text-white"
													: "bg-blue-50 text-blue-700 hover:bg-blue-100"
												: "bg-gray-100 text-gray-400 cursor-not-allowed"
										}`}
										onClick={() => slot.available && setSelectedSlot(slot.startTime)}
										disabled={!slot.available}>
										{slot.startTime}
									</button>
								))}
							</div>
						</div>
						<div>
							<label className="block text-gray-700 text-sm font-semibold mb-3">Notes (Optional)</label>
							<textarea
								className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Any special requests or notes"
								rows={4}
							/>
						</div>
					</div>
				</div>
				<button
					onClick={() => selectedDate && onBookAppointment(selectedSlot || "", notes, selectedDate)}
					disabled={!selectedSlot}
					className={`w-full mt-8 py-3 px-6 rounded-md font-semibold transition-colors ${
						!selectedSlot ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
					}`}>
					Confirm Appointment
				</button>
			</div>
		</div>
	);
};

export default BookingCalendar;
