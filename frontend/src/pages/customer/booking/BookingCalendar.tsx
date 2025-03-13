import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { Customer, Employee, Shift, TimeSlot } from "../../../types";
import CalendarComponent from "../../../components/CustomCalendar";

interface BookingCalendarProps {
	selectedEmployee: Employee;
	selectedDuration: number;
	onBack: () => void;
	onBookAppointment: (selectedSlot: string, notes: string, selectedDate: Date, customer: Customer) => void;
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
	const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
	const [customerEmail, setCustomerEmail] = useState("");
	const [customerPhone, setCustomerPhone] = useState("");
	const [customerName, setCustomerName] = useState("");
	const [error, setError] = useState<string | null>(null);

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

	const handleConfirmClick = () => {
		if (selectedDate && selectedSlot) {
			setIsModalOpen(true); // Open the modal
		}
	};

	const handleFinalBooking = () => {
		const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
		if (!customerEmail || !customerEmail.includes("@")) {
			setError("Please enter a valid email address");
			return;
		}
		if (!phoneRegex.test(customerPhone)) {
			setError("Phone number must be in format XXX-XXX-XXXX");
			return;
		}

		setError(null);
		onBookAppointment(selectedSlot!, notes, selectedDate!, {
			email: customerEmail,
			phoneNumber: customerPhone,
			name: customerName || undefined,
		});
		setIsModalOpen(false); // Close modal after booking
		// Reset form fields
		setCustomerEmail("");
		setCustomerPhone("");
		setCustomerName("");
		setSelectedSlot(null);
		setNotes("");
	};

	// Phone number formatting function
	const formatPhoneNumber = (value: string) => {
		// Remove all non-digit characters
		const digits = value.replace(/\D/g, "");
		// Apply formatting based on length
		if (digits.length <= 3) return digits;
		if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
		return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
	};

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatPhoneNumber(e.target.value);
		setCustomerPhone(formatted);
	};

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
										className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
											slot.available
												? selectedSlot === slot.startTime
													? "bg-blue-600 text-white shadow-md"
													: "bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 border border-gray-400"
												: "bg-gray-100 text-red-800 border border-red-600 cursor-not-allowed opacity-75"
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
					onClick={handleConfirmClick}
					disabled={!selectedSlot}
					className={`w-full mt-8 py-3 px-6 rounded-md font-semibold transition-colors ${
						!selectedSlot ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600"
					}`}>
					Confirm Appointment
				</button>

				{/* Confirmation Modal */}
				{isModalOpen && selectedDate && selectedSlot && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-6 w-full max-w-md">
							<h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Your Booking</h3>

							{/* Booking Details */}
							<div className="space-y-2 mb-6">
								<p>
									<strong>Employee:</strong> {selectedEmployee.name}
								</p>
								<p>
									<strong>Service Duration:</strong> {selectedDuration} minutes
								</p>
								<p>
									<strong>Date:</strong> {format(selectedDate, "MMMM d, yyyy")}
								</p>
								<p>
									<strong>Time:</strong> {selectedSlot}
								</p>
								<p>
									<strong>Notes:</strong> {notes || "None"}
								</p>
							</div>

							{/* Customer Details Form */}
							<div className="space-y-4">
								<div>
									<label className="block text-gray-700 text-sm font-semibold mb-1">Email</label>
									<input
										type="email"
										value={customerEmail}
										onChange={(e) => setCustomerEmail(e.target.value)}
										className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter your email"
										required
									/>
								</div>
								<div>
									<label className="block text-gray-700 text-sm font-semibold mb-1">Phone Number</label>
									<input
										type="text"
										value={customerPhone}
										onChange={handlePhoneChange}
										className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="XXX-XXX-XXXX"
										maxLength={12} // Limit to XXX-XXX-XXXX length
										required
									/>
								</div>
								<div>
									<label className="block text-gray-700 text-sm font-semibold mb-1">Name (Optional)</label>
									<input
										type="text"
										value={customerName}
										onChange={(e) => setCustomerName(e.target.value)}
										className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
										placeholder="Enter your name"
									/>
								</div>
								{error && <p className="text-red-500 text-sm">{error}</p>}
							</div>

							{/* Modal Actions */}
							<div className="flex justify-end gap-4 mt-6">
								<button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:text-gray-900">
									Cancel
								</button>
								<button
									onClick={handleFinalBooking}
									className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
									Book Now
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default BookingCalendar;
