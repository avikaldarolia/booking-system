import { useState, useEffect } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import axios from "axios";
import { addWeeks, endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Spinner from "../../components/Spinner";
import { Availability, Reservation, Shift } from "../../types";

const localizer = momentLocalizer(moment);

type ResourceType = "shift" | "reservation" | "availability";

const EmployeeSchedule = () => {
	const { user } = useAuth();
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [currentDate, setCurrentDate] = useState(new Date());
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
						stateSetters[key as keyof typeof stateSetters](result.value.data.success ? result.value.data.data : []);
					} else {
						console.error(`Error fetching ${key}:`, result.reason);
					}
				});
			} catch (error) {
				console.error("Error fetching schedule:", error);
				setLoading(false);
			} finally {
				setLoading(false);
			}
		};

		fetchSchedule();
	}, [user]);

	const handlePreviousWeek = () => {
		setCurrentDate(subWeeks(currentDate, 1));
	};

	const handleNextWeek = () => {
		setCurrentDate(addWeeks(currentDate, 1));
	};

	const events = [
		...shifts.map((shift) => {
			return {
				id: shift.id,
				title: "Shift",
				start: new Date(`${shift.date}T${shift.startTime}`),
				end: new Date(`${shift.date}T${shift.endTime}`),
				resource: "shift",
			};
		}),
		...reservations.map((reservation) => {
			return {
				id: reservation.id,
				title: `Appointment: ${reservation.customer.name}`,
				start: new Date(`${reservation.date}T${reservation.startTime}`),
				end: new Date(`${reservation.date}T${reservation.endTime}`),
				resource: "reservation",
			};
		}),
		...availabilities.map((availability) => {
			return {
				id: availability.id,
				title: `Blocked ${availability.note}`,
				start: new Date(`${availability.date}T${availability.startTime}`),
				end: new Date(`${availability.date}T${availability.endTime}`),
				resource: "availability",
			};
		}),
	];

	console.log(availabilities);

	if (loading) {
		return <Spinner />;
	}

	return (
		<div className="p-6">
			<div className="bg-white rounded-lg shadow-lg p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-2xl font-bold text-gray-800">My Schedule</h2>
					<div className="flex items-center space-x-2">
						<button onClick={handlePreviousWeek} className="p-2 rounded-full hover:bg-gray-200">
							<ChevronLeft className="h-5 w-5" />
						</button>
						<div className="bg-white px-4 py-2 rounded-lg shadow">
							<CalendarIcon className="h-5 w-5 text-blue-500 inline mr-2" />
							<span>
								{format(startOfWeek(currentDate), "MMM d")} - {format(endOfWeek(currentDate), "MMM d, yyyy")}
							</span>
						</div>
						<button onClick={handleNextWeek} className="p-2 rounded-full hover:bg-gray-200">
							<ChevronRight className="h-5 w-5" />
						</button>
					</div>
				</div>

				<div style={{ height: "600px" }}>
					<BigCalendar
						localizer={localizer}
						events={events}
						views={["week", "day"]}
						defaultView="week"
						startAccessor="start"
						endAccessor="end"
						onNavigate={(date) => setCurrentDate(date)}
						date={currentDate}
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
