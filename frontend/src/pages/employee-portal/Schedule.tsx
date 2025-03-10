import { useState, useEffect } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import axios from "axios";
import { format } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { Calendar as CalendarIcon } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Spinner from "../../components/Spinner";
import { Availability, Reservation, Shift } from "../../types";

const localizer = momentLocalizer(moment);

type ResourceType = "shift" | "reservation" | "availability";

const EmployeeSchedule = () => {
	const { user } = useAuth();
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [reservations, setReservations] = useState<Reservation[]>([]);
	const [availabilities, setAvailabilities] = useState<Availability[]>([]);
	const [loading, setLoading] = useState(true);

	const getClassNameByResource = (resource: ResourceType) => {
		const colorHash = {
			shift: "oklch(0.623 0.214 259.815)",
			reservation: "oklch(0.627 0.194 149.214)",
			availability: "oklch(0.577 0.245 27.325)",
		};

		return colorHash[resource];
	};
	useEffect(() => {
		const fetchSchedule = async () => {
			try {
				const [shiftsRes, reservationsRes, availabilityRes] = await Promise.all([
					axios.get(`shifts?employeeId=${user?.id}`),
					axios.get(`reservations?employeeId=${user?.id}`),
					axios.get(`availability/employee/${user?.id}`),
				]);

				setShifts(shiftsRes.data);
				setReservations(reservationsRes.data);
				setAvailabilities(availabilityRes.data);
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
		...shifts.map((shift) => {
			const shiftDate = new Date(shift.date);

			const [startHours, startMinutes] = shift.startTime.split(":").map(Number);
			const [endHours, endMinutes] = shift.endTime.split(":").map(Number);

			const start = new Date(shiftDate);
			start.setHours(startHours, startMinutes, 0);

			const end = new Date(shiftDate);
			end.setHours(endHours, endMinutes, 0);
			return {
				id: shift.id,
				title: "Shift",
				start,
				end,
				resource: "shift",
			};
		}),
		...reservations.map((reservation) => {
			const reservationDate = new Date(reservation.date);

			const [startHours, startMinutes] = reservation.startTime.split(":").map(Number);
			const [endHours, endMinutes] = reservation.endTime.split(":").map(Number);

			const start = new Date(reservationDate);
			start.setHours(startHours, startMinutes, 0);

			const end = new Date(reservationDate);
			end.setHours(endHours, endMinutes, 0);
			return {
				id: reservation.id,
				title: `Appointment: ${reservation.customer.name}`,
				start: new Date(`${reservation.date}T${reservation.startTime}`),
				end: new Date(`${reservation.date}T${reservation.endTime}`),
				resource: "reservation",
			};
		}),
		...availabilities.map((availability) => {
			const availabilityDate = new Date(availability.date);

			const [startHours, startMinutes] = availability.startTime.split(":").map(Number);
			const [endHours, endMinutes] = availability.endTime.split(":").map(Number);

			const start = new Date(availabilityDate);
			start.setHours(startHours, startMinutes, 0);

			const end = new Date(availabilityDate);
			end.setHours(endHours, endMinutes, 0);
			return {
				id: availability.id,
				title: `Blocked ${availability.note}`,
				start: new Date(`${availability.date}T${availability.startTime}`),
				end: new Date(`${availability.date}T${availability.endTime}`),
				resource: "availability",
			};
		}),
	];

	if (loading) {
		return <Spinner />;
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
							className: getClassNameByResource(event.resource as ResourceType),
							style: {
								backgroundColor: getClassNameByResource(event.resource as ResourceType),
							},
						})}
					/>
				</div>
			</div>
		</div>
	);
};

export default EmployeeSchedule;
