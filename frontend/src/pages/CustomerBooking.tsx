import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
// import { Calendar, Clock, Star, User, Phone, Mail } from "lucide-react";
import { Star, User, Phone, Mail } from "lucide-react";
// import { format, addDays, isAfter, isBefore, parseISO } from "date-fns";
import { format, addDays } from "date-fns";

interface Employee {
	id: string;
	name: string;
	specialties: string;
	bio: string;
	imageUrl: string;
	hourlyRate: number;
}

interface TimeSlot {
	startTime: string;
	endTime: string;
	available: boolean;
}

const CustomerBooking = () => {
	const { employeeId } = useParams();
	const navigate = useNavigate();

	const [employee, setEmployee] = useState<Employee | null>(null);
	const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
	const [selectedDuration, setSelectedDuration] = useState(60);
	const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
	const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
	const [customerInfo, setCustomerInfo] = useState({
		name: "",
		email: "",
		phone: "",
		notes: "",
	});
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		const fetchEmployeeData = async () => {
			try {
				const response = await axios.get(`employees/${employeeId}`);
				setEmployee(response.data);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching employee data:", error);
				// For demo, set mock data
				setEmployee({
					id: employeeId || "1",
					name: "John Doe",
					specialties: "Hair Styling, Coloring",
					bio: "Professional stylist with 5 years of experience",
					imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
					hourlyRate: 50,
				});
				setLoading(false);
			}
		};

		fetchEmployeeData();
	}, [employeeId]);

	useEffect(() => {
		const fetchAvailableSlots = async () => {
			try {
				const response = await axios.get(
					`availability/${employeeId}/slots?date=${selectedDate}&duration=${selectedDuration}`
				);
				setAvailableSlots(response.data);
			} catch (error) {
				console.error("Error fetching available slots:", error);
				// For demo, set mock slots
				const mockSlots = [
					{ startTime: "09:00", endTime: "09:30", available: true },
					{ startTime: "09:30", endTime: "10:00", available: false },
					{ startTime: "10:00", endTime: "10:30", available: true },
					{ startTime: "10:30", endTime: "11:00", available: true },
					{ startTime: "11:00", endTime: "11:30", available: true },
				];
				setAvailableSlots(mockSlots);
			}
		};

		if (selectedDate && selectedDuration) {
			fetchAvailableSlots();
		}
	}, [employeeId, selectedDate, selectedDuration]);

	const handleBooking = async () => {
		if (!selectedSlot || !employee) return;

		setSubmitting(true);

		try {
			await axios.post("reservations", {
				employeeId,
				date: selectedDate,
				startTime: selectedSlot,
				duration: selectedDuration,
				customerInfo,
			});

			// Show success message and redirect
			alert("Booking successful! You will receive a confirmation email shortly.");
			navigate("/");
		} catch (error) {
			console.error("Error creating reservation:", error);
			alert("There was an error creating your reservation. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	if (!employee) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-800">Employee not found</h2>
					<button onClick={() => navigate("/")} className="mt-4 text-blue-500 hover:text-blue-600">
						Return to Home
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-4xl mx-auto">
				<div className="bg-white rounded-lg shadow-lg overflow-hidden">
					<div className="md:flex">
						<div className="md:flex-shrink-0">
							<img className="h-48 w-full object-cover md:w-48" src={employee.imageUrl} alt={employee.name} />
						</div>
						<div className="p-8">
							<div className="flex items-center">
								<h2 className="text-2xl font-bold text-gray-800">{employee.name}</h2>
								<div className="ml-4 flex items-center text-yellow-400">
									<Star className="h-5 w-5 fill-current" />
									<Star className="h-5 w-5 fill-current" />
									<Star className="h-5 w-5 fill-current" />
									<Star className="h-5 w-5 fill-current" />
									<Star className="h-5 w-5 fill-current" />
								</div>
							</div>
							<p className="mt-2 text-gray-600">{employee.bio}</p>
							<div className="mt-4">
								<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
									${employee.hourlyRate}/hour
								</span>
								{employee.specialties.split(",").map((specialty, index) => (
									<span
										key={index}
										className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
										{specialty.trim()}
									</span>
								))}
							</div>
						</div>
					</div>

					<div className="border-t border-gray-200 p-8">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							<div>
								<h3 className="text-lg font-semibold mb-4">Select Date & Duration</h3>
								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
									<input
										type="date"
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
										value={selectedDate}
										min={format(new Date(), "yyyy-MM-dd")}
										max={format(addDays(new Date(), 30), "yyyy-MM-dd")}
										onChange={(e) => setSelectedDate(e.target.value)}
									/>
								</div>

								<div className="mb-4">
									<label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
									<select
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
										value={selectedDuration}
										onChange={(e) => setSelectedDuration(parseInt(e.target.value))}>
										<option value={30}>30 minutes</option>
										<option value={45}>45 minutes</option>
										<option value={60}>1 hour</option>
									</select>
								</div>

								<div>
									<h4 className="text-sm font-medium text-gray-700 mb-2">Available Time Slots</h4>
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
							</div>

							<div>
								<h3 className="text-lg font-semibold mb-4">Your Information</h3>
								<div className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
										<div className="relative">
											<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
												<User className="h-5 w-5 text-gray-400" />
											</div>
											<input
												type="text"
												className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
												value={customerInfo.name}
												onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
												placeholder="Your full name"
											/>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
										<div className="relative">
											<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
												<Mail className="h-5 w-5 text-gray-400" />
											</div>
											<input
												type="email"
												className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
												value={customerInfo.email}
												onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
												placeholder="your@email.com"
											/>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
										<div className="relative">
											<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
												<Phone className="h-5 w-5 text-gray-400" />
											</div>
											<input
												type="tel"
												className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
												value={customerInfo.phone}
												onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
												placeholder="(123) 456-7890"
											/>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
										<textarea
											className="w-full px-3 py-2 border border-gray-300 rounded-md"
											rows={3}
											value={customerInfo.notes}
											onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
											placeholder="Any special requests or notes"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-gray-50 px-8 py-4">
						<div className="flex items-center justify-between">
							<div>
								{selectedSlot && (
									<p className="text-sm text-gray-600">
										Selected time: <span className="font-semibold">{selectedSlot}</span>
										<br />
										Duration: <span className="font-semibold">{selectedDuration} minutes</span>
										<br />
										Total:{" "}
										<span className="font-semibold">${(employee.hourlyRate * (selectedDuration / 60)).toFixed(2)}</span>
									</p>
								)}
							</div>
							<button
								onClick={handleBooking}
								disabled={
									!selectedSlot || submitting || !customerInfo.name || !customerInfo.email || !customerInfo.phone
								}
								className={`${
									!selectedSlot || submitting || !customerInfo.name || !customerInfo.email || !customerInfo.phone
										? "bg-gray-300 cursor-not-allowed"
										: "bg-blue-500 hover:bg-blue-600"
								} text-white px-6 py-2 rounded-md`}>
								{submitting ? "Booking..." : "Book Appointment"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CustomerBooking;
