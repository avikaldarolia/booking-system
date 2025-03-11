import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Search, Filter, Check, X } from "lucide-react";
// import { Calendar, Clock, User, Search, Filter, Check, X } from "lucide-react";
import { format, parseISO } from "date-fns";

interface Reservation {
	id: string;
	employee: {
		id: string;
		name: string;
	};
	customer: {
		id: string;
		name: string;
		email: string;
		phone: string;
	};
	date: string;
	startTime: string;
	endTime: string;
	status: string;
	notes: string;
}

const Reservations = () => {
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [statusFilter, setStatusFilter] = useState("all");
	const [dateFilter, setDateFilter] = useState(format(new Date(), "yyyy-MM-dd"));

	useEffect(() => {
		const fetchReservations = async () => {
			try {
				const response = await axios.get("reservations", {
					params: {
						date: dateFilter,
						status: statusFilter !== "all" ? statusFilter : undefined,
					},
				});
				setReservations(response.data);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching reservations:", error);
				setLoading(false);
			}
		};

		fetchReservations();
	}, [dateFilter, statusFilter]);

	const handleStatusUpdate = async (id: string, status: string) => {
		try {
			await axios.patch(`reservations/${id}/status`, { status });
			setReservations(reservations.map((res) => (res.id === id ? { ...res, status } : res)));
		} catch (error) {
			console.error("Error updating reservation status:", error);
		}
	};

	const filteredReservations = reservations.filter(
		(res) =>
			res.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			res.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			res.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
	);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-gray-800">Reservations</h1>
				<div className="flex items-center space-x-4">
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Search className="h-5 w-5 text-gray-400" />
						</div>
						<input
							type="text"
							placeholder="Search reservations..."
							className="pl-10 pr-3 py-2 border border-gray-300 rounded-md"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					<div className="flex items-center space-x-2">
						<Calendar className="h-5 w-5 text-gray-400" />
						<input
							type="date"
							className="border border-gray-300 rounded-md px-3 py-2"
							value={dateFilter}
							onChange={(e) => setDateFilter(e.target.value)}
						/>
					</div>

					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-400" />
						<select
							className="border border-gray-300 rounded-md px-3 py-2"
							value={statusFilter}
							onChange={(e) => setStatusFilter(e.target.value)}>
							<option value="all">All Status</option>
							<option value="pending">Pending</option>
							<option value="confirmed">Confirmed</option>
							<option value="completed">Completed</option>
							<option value="cancelled">Cancelled</option>
						</select>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Customer
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Employee
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Date & Time
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredReservations.map((reservation) => (
								<tr key={reservation.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div>
											<div className="text-sm font-medium text-gray-900">{reservation.customer.name}</div>
											<div className="text-sm text-gray-500">{reservation.customer.email}</div>
											<div className="text-sm text-gray-500">{reservation.customer.phone}</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">{reservation.employee.name}</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">{format(parseISO(reservation.date), "MMM d, yyyy")}</div>
										<div className="text-sm text-gray-500">
											{reservation.startTime} - {reservation.endTime}
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
												reservation.status === "confirmed"
													? "bg-green-100 text-green-800"
													: reservation.status === "cancelled"
													? "bg-red-100 text-red-800"
													: reservation.status === "completed"
													? "bg-blue-100 text-blue-800"
													: "bg-yellow-100 text-yellow-800"
											}`}>
											{reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										{reservation.status === "pending" && (
											<div className="flex justify-end space-x-2">
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
										{reservation.status === "confirmed" && (
											<button
												onClick={() => handleStatusUpdate(reservation.id, "completed")}
												className="text-blue-500 hover:text-blue-700">
												Complete
											</button>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default Reservations;
