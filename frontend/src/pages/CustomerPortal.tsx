import { useState, useEffect } from "react";
import axios from "axios";
// import { Calendar, Clock, User, Star } from "lucide-react";
import { Calendar, Clock, Star } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";

interface Reservation {
	id: string;
	employee: {
		id: string;
		name: string;
		imageUrl: string;
	};
	date: string;
	startTime: string;
	endTime: string;
	status: string;
	notes: string;
}

interface Employee {
	id: string;
	name: string;
	specialties: string;
	imageUrl: string;
	hourlyRate: number;
	rating: number;
}

const CustomerPortal = () => {
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState(true);
	console.log("here");

	useEffect(() => {
		const fetchCustomerData = async () => {
			try {
				const [reservationsRes, employeesRes] = await Promise.all([
					axios.get("reservations/customer"),
					axios.get("employees"),
				]);

				setReservations(reservationsRes.data);
				setEmployees(employeesRes.data);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching customer data:", error);
				// For demo, set mock data
				setReservations([
					{
						id: "1",
						employee: {
							id: "1",
							name: "John Doe",
							imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
						},
						date: "2023-06-15",
						startTime: "10:00",
						endTime: "11:00",
						status: "confirmed",
						notes: "First appointment",
					},
				]);

				setEmployees([
					{
						id: "1",
						name: "John Doe",
						specialties: "Hair Styling, Coloring",
						imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
						hourlyRate: 50,
						rating: 4.8,
					},
					{
						id: "2",
						name: "Jane Smith",
						specialties: "Makeup, Skincare",
						imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
						hourlyRate: 45,
						rating: 4.9,
					},
				]);

				setLoading(false);
			}
		};

		fetchCustomerData();
	}, []);

	const handleCancelReservation = async (id: string) => {
		if (window.confirm("Are you sure you want to cancel this reservation?")) {
			try {
				await axios.patch(`reservations/${id}/status`, { status: "cancelled" });
				setReservations(reservations.map((res) => (res.id === id ? { ...res, status: "cancelled" } : res)));
			} catch (error) {
				console.error("Error cancelling reservation:", error);
				alert("Error cancelling reservation. Please try again.");
			}
		}
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
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-gray-800 mb-6">Your Appointments</h1>
				{reservations.length === 0 ? (
					<div className="bg-white rounded-lg shadow p-6 text-center">
						<p className="text-gray-500 mb-4">You don't have any appointments scheduled.</p>
						<Link to="/" className="text-blue-500 hover:text-blue-600 font-medium">
							Browse Available Services
						</Link>
					</div>
				) : (
					<div className="grid gap-6">
						{reservations.map((reservation) => (
							<div key={reservation.id} className="bg-white rounded-lg shadow p-6">
								<div className="flex items-start justify-between">
									<div className="flex items-center">
										<img
											src={reservation.employee.imageUrl}
											alt={reservation.employee.name}
											className="h-12 w-12 rounded-full object-cover"
										/>
										<div className="ml-4">
											<h3 className="font-medium text-gray-900">{reservation.employee.name}</h3>
											<div className="flex items-center text-sm text-gray-500">
												<Calendar className="h-4 w-4 mr-1" />
												{format(parseISO(reservation.date), "MMM d, yyyy")}
												<Clock className="h-4 w-4 ml-3 mr-1" />
												{reservation.startTime} - {reservation.endTime}
											</div>
										</div>
									</div>
									<div className="flex flex-col items-end">
										<span
											className={`px-2 py-1 rounded-full text-xs font-medium ${
												reservation.status === "confirmed"
													? "bg-green-100 text-green-800"
													: reservation.status === "completed"
													? "bg-blue-100 text-blue-800"
													: reservation.status === "cancelled"
													? "bg-red-100 text-red-800"
													: "bg-yellow-100 text-yellow-800"
											}`}>
											{reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
										</span>
										{reservation.status === "confirmed" && (
											<button
												onClick={() => handleCancelReservation(reservation.id)}
												className="mt-2 text-sm text-red-600 hover:text-red-800">
												Cancel Appointment
											</button>
										)}
									</div>
								</div>
								{reservation.notes && <p className="mt-4 text-sm text-gray-600">Note: {reservation.notes}</p>}
							</div>
						))}
					</div>
				)}
			</div>

			<div>
				<h2 className="text-2xl font-bold text-gray-800 mb-6">Available Services</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{employees.map((employee) => (
						<Link
							key={employee.id}
							to={`/book/${employee.id}`}
							className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
							<img src={employee.imageUrl} alt={employee.name} className="w-full h-48 object-cover" />
							<div className="p-6">
								<div className="flex justify-between items-start">
									<div>
										<h3 className="font-medium text-gray-900">{employee.name}</h3>
										<div className="flex items-center mt-1">
											<Star className="h-4 w-4 text-yellow-400 fill-current" />
											<span className="ml-1 text-sm text-gray-600">{employee.rating.toFixed(1)}</span>
										</div>
									</div>
									<span className="text-blue-500 font-medium">${employee.hourlyRate}/hr</span>
								</div>
								<div className="mt-4">
									{employee.specialties.split(",").map((specialty, index) => (
										<span
											key={index}
											className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-medium text-gray-700 mr-2 mb-2">
											{specialty.trim()}
										</span>
									))}
								</div>
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
};

export default CustomerPortal;
