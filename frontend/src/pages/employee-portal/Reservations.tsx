import { useState, useEffect } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { Calendar, Clock, User, Check, X } from "lucide-react";
import { Reservation } from "../../types";
import Spinner from "../../components/Spinner";

const EmployeeReservations = () => {
	const { user } = useAuth();
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchReservations = async () => {
			try {
				const response = await axios.get(`reservations?employeeId=${user?.id}`);
				setReservations(response.data);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching reservations:", error);
				setLoading(false);
			}
		};

		if (user?.id) {
			fetchReservations();
		}
	}, [user]);

	const handleStatusUpdate = async (id: string, status: string) => {
		try {
			await axios.patch(`reservations/${id}/status`, { status });
			setReservations(reservations.map((res) => (res.id === id ? { ...res, status } : res)));
		} catch (error) {
			console.error("Error updating reservation status:", error);
		}
	};

	if (loading) {
		return <Spinner />;
	}

	return (
		<div className="p-6">
			<h2 className="text-2xl font-bold text-gray-800 mb-6">My Reservations</h2>

			<div className="grid gap-6">
				{reservations.map((reservation) => (
					<div key={reservation.id} className="bg-white rounded-lg shadow-lg p-6">
						<div className="flex justify-between items-start">
							<div>
								<div className="flex items-center mb-2">
									<User className="h-5 w-5 text-blue-500 mr-2" />
									<h3 className="text-lg font-semibold">{reservation.customer.name}</h3>
								</div>
								<div className="flex items-center text-gray-600 mb-1">
									<Calendar className="h-4 w-4 mr-2" />
									{format(parseISO(reservation.date), "MMMM d, yyyy")}
								</div>
								<div className="flex items-center text-gray-600">
									<Clock className="h-4 w-4 mr-2" />
									{reservation.startTime} - {reservation.endTime}
								</div>
							</div>

							<div className="flex flex-col items-end">
								<span
									className={`px-3 py-1 rounded-full text-sm font-medium ${
										reservation.status === "confirmed"
											? "bg-green-100 text-green-800"
											: reservation.status === "cancelled"
											? "bg-red-100 text-red-800"
											: "bg-yellow-100 text-yellow-800"
									}`}>
									{reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
								</span>

								{reservation.status === "pending" && (
									<div className="mt-2 space-x-2">
										<button
											onClick={() => handleStatusUpdate(reservation.id, "confirmed")}
											className="text-green-500 hover:text-green-700">
											<Check className="h-5 w-5" />
										</button>
										<button
											onClick={() => handleStatusUpdate(reservation.id, "cancelled")}
											className="text-red-500 hover:text-red-700">
											<X className="h-5 w-5" />
										</button>
									</div>
								)}
							</div>
						</div>

						{reservation.notes && (
							<div className="mt-4 text-gray-600">
								<p className="text-sm">{reservation.notes}</p>
							</div>
						)}

						<div className="mt-4 pt-4 border-t">
							<div className="text-sm text-gray-600">
								<p>Email: {reservation.customer.email}</p>
								<p>Phone: {reservation.customer.phone}</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default EmployeeReservations;
