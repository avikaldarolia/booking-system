import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Clock } from "lucide-react";
import { format, parseISO } from "date-fns";
import { Link } from "react-router-dom";
import Spinner from "../../components/Spinner";
import { useAuth } from "../../contexts/AuthContext";
import { Reservation } from "../../types";

const CustomerAppointments = () => {
	const { user } = useAuth();
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);

	const today = new Date().toISOString().split("T")[0];

	useEffect(() => {
		if (!user) {
			setLoading(false);
			return;
		}
		const fetchCustomerData = async () => {
			try {
				const reservations = await axios.get(`reservations?customerId=${user.id}`);
				setReservations(reservations.data);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching customer data:", error);
				setLoading(false);
			}
		};

		fetchCustomerData();
	}, [user]);

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
		return <Spinner />;
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
										{reservation.date >= today && reservation.status === "confirmed" && (
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
		</div>
	);
};

export default CustomerAppointments;
