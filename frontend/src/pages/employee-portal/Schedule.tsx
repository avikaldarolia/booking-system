import { useState, useEffect } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import axios from "axios";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { Calendar as CalendarIcon } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

interface Shift {
	id: string;
	date: string;
	startTime: string;
	endTime: string;
	note: string;
}

interface Reservation {
	id: string;
	customer: {
		name: string;
	};
	date: string;
	startTime: string;
	endTime: string;
	status: string;
}

const EmployeeSchedule = () => {
	const { user } = useAuth();
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchSchedule = async () => {
			try {
				const [shiftsRes, reservationsRes] = await Promise.all([
					axios.get(`/api/shifts?employeeId=${user?.id}`),
					axios.get(`/api/reservations?employeeId=${user?.id}`),
				]);

				setShifts(shiftsRes.data);
				setReservations(reservationsRes.data);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching schedule:", error);
				setLoading(false);
			}
		};

		if (user?.id) {
			fetchSchedule();
		}
	}, [user]);

	const events = [
		...shifts.map((shift) => ({
			id: shift.id,
			title: "Shift",
			start: new Date(`${shift.date}T${shift.startTime}`),
			end: new Date(`${shift.date}T${shift.endTime}`),
			resource: "shift",
		})),
		...reservations.map((reservation) => ({
			id: reservation.id,
			title: `Appointment: ${reservation.customer.name}`,
			start: new Date(`${reservation.date}T${reservation.startTime}`),
			end: new Date(`${reservation.date}T${reservation.endTime}`),
			resource: "reservation",
		})),
	];

	if (loading) {
		return (
			<div className="flex justify-center items-center h-full">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="p-6">
			<div className="bg-white rounded-lg shadow-lg p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-gray-800">My Schedule</h2>
					<div className="flex items-center">
						<CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
						<span className="text-gray-600">{format(new Date(), "MMMM yyyy")}</span>
					</div>
				</div>

				<div style={{ height: "600px" }}>
					<BigCalendar
						localizer={localizer}
						events={events}
						views={["month", "week", "day"]}
						defaultView="week"
						startAccessor="start"
						endAccessor="end"
						eventPropGetter={(event) => ({
							className: event.resource === "shift" ? "bg-blue-500" : "bg-green-500",
						})}
					/>
				</div>
			</div>
		</div>
	);
};

export default EmployeeSchedule;
