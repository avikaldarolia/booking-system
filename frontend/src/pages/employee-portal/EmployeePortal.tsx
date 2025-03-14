import { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, Clock, CalendarCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { Availability, Reservation, Shift } from "../../types";
import Spinner from "../../components/Spinner";

const EmployeePortal = () => {
	const { user } = useAuth();
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [availabilities, setAvailabilities] = useState<Availability[]>([]);
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchEmployeeData = async () => {
			if (!user?.id) {
				setLoading(false);
				return;
			}

			const endpoints = {
				shifts: `shifts?employeeId=${user.id}`,
				availabilities: `availability/employee/${user.id}`,
				reservations: `reservations?employeeId=${user.id}`,
			};

			try {
				const results = await Promise.allSettled(Object.entries(endpoints).map(([, url]) => axios.get(url)));

				const stateSetters = {
					shifts: setShifts,
					availabilities: setAvailabilities,
					reservations: setReservations,
				};

				Object.keys(endpoints).forEach((key, index) => {
					const result = results[index];

					if (result.status === "fulfilled") {
						stateSetters[key as keyof typeof stateSetters](result.value.data);
					} else {
						console.error(`Error fetching ${key}:`, result.reason);
					}
				});
			} catch (error) {
				console.error("Unexpected error:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchEmployeeData();
	}, [user]);

	if (loading) {
		return <Spinner />;
	}

	return (
		<div className="container mx-auto px-4 py-6">
			<h1 className="text-2xl font-bold text-gray-800 mb-6">Welcome, {user?.name}</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center mb-4">
						<div className="p-3 rounded-full bg-blue-100 text-blue-500 mr-4">
							<Calendar className="h-6 w-6" />
						</div>
						<h2 className="text-xl font-semibold">Upcoming Shifts</h2>
					</div>

					{shifts.length === 0 ? (
						<p className="text-gray-500">No upcoming shifts scheduled</p>
					) : (
						<div className="space-y-4">
							{shifts.map((shift) => (
								<div key={shift.id} className="border-l-4 border-blue-500 pl-4">
									<p className="font-medium">{format(parseISO(shift.date), "EEEE, MMM d")}</p>
									<p className="text-gray-600">
										{shift.startTime} - {shift.endTime}
									</p>
									{shift.note && <p className="text-sm text-gray-500 mt-1">{shift.note}</p>}
								</div>
							))}
						</div>
					)}
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center mb-4">
						<div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
							<Clock className="h-6 w-6" />
						</div>
						<h2 className="text-xl font-semibold">Availability Blocks</h2>
					</div>

					{availabilities.length === 0 ? (
						<p className="text-gray-500">No availability blocks set</p>
					) : (
						<div className="space-y-4">
							{availabilities.map((availability) => (
								<div
									key={availability.id}
									className={`border-l-4 pl-4 ${availability.isBlocked ? "border-red-500" : "border-green-500"}`}>
									<p className="font-medium">{format(parseISO(availability.date), "EEEE, MMM d")}</p>
									<p className="text-gray-600">
										{availability.startTime} - {availability.endTime}
									</p>
									{availability.note && <p className="text-sm text-gray-500 mt-1">{availability.note}</p>}
								</div>
							))}
						</div>
					)}
				</div>

				<div className="bg-white rounded-lg shadow p-6">
					<div className="flex items-center mb-4">
						<div className="p-3 rounded-full bg-green-100 text-green-500 mr-4">
							<CalendarCheck className="h-6 w-6" />
						</div>
						<h2 className="text-xl font-semibold">Upcoming Reservations</h2>
					</div>

					{reservations.length === 0 ? (
						<p className="text-gray-500">No upcoming reservations</p>
					) : (
						<div className="space-y-4">
							{reservations.map((reservation) => (
								<div key={reservation.id} className="border-l-4 border-green-500 pl-4">
									<p className="font-medium">{format(parseISO(reservation.date), "EEEE, MMM d")}</p>
									<p className="text-gray-600">
										{reservation.startTime} - {reservation.endTime}
									</p>
									<p className="text-sm font-medium mt-1">{reservation.customer.name}</p>
									{reservation.notes && <p className="text-sm text-gray-500 mt-1">{reservation.notes}</p>}
									<span
										className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
											reservation.status === "confirmed"
												? "bg-green-100 text-green-800"
												: reservation.status === "cancelled"
												? "bg-red-100 text-red-800"
												: "bg-yellow-100 text-yellow-800"
										}`}>
										{reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default EmployeePortal;
