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
	const [filter, setFilter] = useState({ search: "", status: "all" });

	const today = new Date().toISOString().split("T")[0];

	useEffect(() => {
		if (!user) {
			setLoading(false);
			return;
		}
		const fetchCustomerData = async () => {
			try {
				const reservations = await axios.get(`reservations?customerId=${user.id}`);
				setReservations(reservations.data.data);
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

	// Filter reservations based on search and status
	const filteredReservations = reservations.filter((reservation) => {
		const matchesSearch =
			reservation.employee.name.toLowerCase().includes(filter.search.toLowerCase()) ||
			format(parseISO(reservation.date), "MMM d, yyyy").toLowerCase().includes(filter.search.toLowerCase());
		const matchesStatus = filter.status === "all" || reservation.status === filter.status;
		return matchesSearch && matchesStatus;
	});

	if (loading) {
		return <Spinner />;
	}

	return (
		<div className="container mx-auto px-4 py-6">
			<h1 className="text-2xl font-bold text-gray-800 mb-6">Your Appointments</h1>

			{reservations.length === 0 ? (
				<div className="bg-white rounded-lg shadow p-6 text-center">
					<p className="text-gray-500 mb-4">You don't have any appointments scheduled.</p>
					<Link to="/" className="text-blue-500 hover:text-blue-600 font-medium">
						Browse Available Services
					</Link>
				</div>
			) : (
				<div className="space-y-6">
					{/* Filter Section */}
					<div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow">
						<input
							type="text"
							placeholder="Search by name or date..."
							value={filter.search}
							onChange={(e) => setFilter({ ...filter, search: e.target.value })}
							className="w-full sm:w-1/3 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
						<div className="flex gap-2">
							{["all", "confirmed", "completed", "cancelled"].map((status) => (
								<button
									key={status}
									onClick={() => setFilter({ ...filter, status })}
									className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${
										filter.status === status ? "bg-blue-500 text-white" : "bg-black text-white hover:bg-gray-400"
									}`}>
									{status.charAt(0).toUpperCase() + status.slice(1)}
								</button>
							))}
						</div>
					</div>

					{/* Table */}
					<div className="overflow-x-auto">
						<table className="min-w-full bg-white rounded-lg shadow-2xl">
							<thead>
								<tr className="bg-black text-white uppercase text-sm leading-normal">
									<th className="py-3 px-6 text-left">Employee</th>
									<th className="py-3 px-6 text-left">Date</th>
									<th className="py-3 px-6 text-left">Time</th>
									<th className="py-3 px-6 text-left">Status</th>
									<th className="py-3 px-6 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="text-gray-600 text-sm font-light">
								{filteredReservations.length === 0 ? (
									<tr>
										<td colSpan={5} className="py-6 text-center text-gray-500">
											No appointments match your filter.
										</td>
									</tr>
								) : (
									filteredReservations.map((reservation) => (
										<tr key={reservation.id} className="border-b border-gray-200 hover:bg-gray-50">
											<td className="py-3 px-6">
												<div className="flex items-center">
													<img
														src={reservation.employee.imageUrl}
														alt={reservation.employee.name}
														className="h-10 w-10 rounded-full object-cover mr-3"
													/>
													<span>{reservation.employee.name}</span>
												</div>
											</td>
											<td className="py-3 px-6">
												<div className="flex items-center">
													<Calendar className="h-4 w-4 mr-2" />
													{format(parseISO(reservation.date), "MMM d, yyyy")}
												</div>
											</td>
											<td className="py-3 px-6">
												<div className="flex items-center">
													<Clock className="h-4 w-4 mr-2" />
													{reservation.startTime} - {reservation.endTime}
												</div>
											</td>
											<td className="py-3 px-6">
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
											</td>
											<td className="py-3 px-6 text-right">
												{reservation.date >= today && reservation.status === "confirmed" && (
													<button
														onClick={() => handleCancelReservation(reservation.id)}
														className="text-red-600 hover:text-red-800 text-sm font-medium">
														Cancel
													</button>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
};

export default CustomerAppointments;
