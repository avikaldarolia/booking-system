import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
// import { useAuth } from "../../contexts/AuthContext";
import { Star } from "lucide-react";
// import { Calendar, Clock, User, Star } from "lucide-react";

interface Employee {
	id: string;
	name: string;
	specialties: string;
	imageUrl: string;
	hourlyRate: number;
	rating: number;
}

interface TimeSlot {
	startTime: string;
	endTime: string;
	available: boolean;
}

const CustomerBook = () => {
	// const { user } = useAuth();
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
	const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
	const [selectedDuration, setSelectedDuration] = useState(60);
	const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
	const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [booking, setBooking] = useState(false);
	const [notes, setNotes] = useState("");

	useEffect(() => {
		const fetchEmployees = async () => {
			try {
				const response = await axios.get("employees");
				setEmployees(response.data);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching employees:", error);
				setLoading(false);
			}
		};

		fetchEmployees();
	}, []);

	useEffect(() => {
		const fetchAvailableSlots = async () => {
			if (!selectedEmployee || !selectedDate) return;

			try {
				const response = await axios.get("reservations/slots", {
					params: {
						employeeId: selectedEmployee.id,
						date: selectedDate,
						duration: selectedDuration,
					},
				});
				setAvailableSlots(response.data);
			} catch (error) {
				console.error("Error fetching available slots:", error);
			}
		};

		fetchAvailableSlots();
	}, [selectedEmployee, selectedDate, selectedDuration]);

	const handleBookAppointment = async () => {
		if (!selectedEmployee || !selectedSlot) return;

		setBooking(true);
		try {
			await axios.post("reservations", {
				employeeId: selectedEmployee.id,
				date: selectedDate,
				startTime: selectedSlot,
				duration: selectedDuration,
				notes,
			});

			alert("Appointment booked successfully!");
			// Reset form
			setSelectedEmployee(null);
			setSelectedDate(format(new Date(), "yyyy-MM-dd"));
			setSelectedSlot(null);
			setNotes("");
		} catch (error) {
			console.error("Error booking appointment:", error);
			alert("Failed to book appointment. Please try again.");
		}
		setBooking(false);
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<h2 className="text-2xl font-bold text-gray-800 mb-6">Book an Appointment</h2>

			<div className="grid md:grid-cols-2 gap-6">
				<div className="bg-white rounded-lg shadow-lg p-6">
					<h3 className="text-lg font-semibold mb-4">Select Professional</h3>
					<div className="grid gap-4">
						{employees.map((employee) => (
							<div
								key={employee.id}
								className={`border rounded-lg p-4 cursor-pointer transition-colors ${
									selectedEmployee?.id === employee.id ? "border-blue-500 bg-blue-50" : "hover:border-blue-300"
								}`}
								onClick={() => setSelectedEmployee(employee)}>
								<div className="flex items-center">
									<img src={employee.imageUrl} alt={employee.name} className="h-12 w-12 rounded-full object-cover" />
									<div className="ml-4">
										<h4 className="font-medium">{employee.name}</h4>
										<div className="flex items-center text-yellow-400">
											<Star className="h-4 w-4 fill-current" />
											<span className="ml-1 text-sm text-gray-600">{employee.rating}</span>
										</div>
									</div>
									<div className="ml-auto text-right">
										<p className="text-blue-500 font-medium">${employee.hourlyRate}/hr</p>
										<p className="text-sm text-gray-500">{employee.specialties}</p>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				{selectedEmployee && (
					<div className="bg-white rounded-lg shadow-lg p-6">
						<h3 className="text-lg font-semibold mb-4">Select Time</h3>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
							<input
								type="date"
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={selectedDate}
								min={format(new Date(), "yyyy-MM-dd")}
								onChange={(e) => setSelectedDate(e.target.value)}
							/>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Duration</label>
							<select
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={selectedDuration}
								onChange={(e) => setSelectedDuration(parseInt(e.target.value))}>
								<option value={30}>30 minutes</option>
								<option value={45}>45 minutes</option>
								<option value={60}>1 hour</option>
							</select>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Available Time Slots</label>
							<div className="grid grid-cols-3 gap-2">
								{availableSlots.map((slot, index) => (
									<button
										key={index}
										className={`px-4 py-2 text-sm rounded-md ${
											slot.available
												? selectedSlot === slot.startTime
													? "bg-blue-500 text-white"
													: "bg-blue-100 text-blue-800 hover:bg-blue-200"
												: "bg-gray-100 text-gray-400 cursor-not-allowed"
										}`}
										onClick={() => slot.available && setSelectedSlot(slot.startTime)}
										disabled={!slot.available}>
										{slot.startTime}
									</button>
								))}
							</div>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Notes (Optional)</label>
							<textarea
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Any special requests or notes"
							/>
						</div>

						<button
							onClick={handleBookAppointment}
							disabled={!selectedSlot || booking}
							className={`w-full py-2 px-4 rounded-md ${
								!selectedSlot || booking ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600 text-white"
							}`}>
							{booking ? "Booking..." : "Book Appointment"}
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default CustomerBook;
