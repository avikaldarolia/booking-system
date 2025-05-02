import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import Spinner from "../../../components/Spinner";
import EmployeeList from "./EmployeeList";
import BookingCalendar from "./BookingCalendar";
import { Service, Employee, Customer } from "../../../types";
import ServicesList from "./ServiceList";

interface BookingProcessProps {
	onBookingSuccess?: () => void;
}

const BookingProcess = ({ onBookingSuccess }: BookingProcessProps) => {
	const [step, setStep] = useState(1);
	const [services, setServices] = useState<Service[] | null>(null);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
	const [selectedService, setSelectedService] = useState<Service | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchEmployees = async () => {
			try {
				setLoading(true);
				const response = await axios.get(`employees`);
				if (response.data.success) {
					setEmployees(response.data.data);
				}
				setLoading(false);
			} catch (error) {
				console.error("Error fetching employees:", error);
				setLoading(false);
			}
		};
		const fetchServices = async () => {
			try {
				setLoading(true);
				const response = await axios.get(`services`);
				if (response.data.success) {
					setServices(response.data.data);
				}
				setLoading(false);
			} catch (error) {
				console.error("Error fetching employees:", error);
				setLoading(false);
			}
		};

		fetchEmployees();
		fetchServices();
	}, []);

	const handleServiceSelect = (service: Service) => {
		setSelectedService(service);
		setStep(2);
	};

	const handleEmployeeSelect = (employee: Employee) => {
		setSelectedEmployee(employee);
		setStep(3);
	};

	const handleBack = () => {
		if (step === 2) {
			setStep(1);
			setSelectedService(null);
		}
		if (step === 3) {
			setStep(2);
			setSelectedEmployee(null);
		}
	};

	const handleBookAppointment = async (selectedSlot: string, notes: string, selectedDate: Date, customer: Customer) => {
		if (!selectedEmployee || !selectedSlot || !selectedDate || !selectedService) return;

		try {
			await axios.post("reservations", {
				employeeId: selectedEmployee.id,
				date: format(selectedDate, "yyyy-MM-dd"),
				startTime: selectedSlot,
				email: customer.email,
				phone: customer.phoneNumber,
				name: customer.name || "",
				notes,
				service: selectedService,
			});

			alert("Appointment booked successfully!");
			setStep(1);
			setSelectedEmployee(null);
			setSelectedService(null);
			if (onBookingSuccess) onBookingSuccess();
		} catch (error) {
			console.error("Error booking appointment:", error);
			alert("Failed to book appointment. Please try again.");
		}
	};

	if (loading) {
		return <Spinner />;
	}

	return (
		<main className="flex-1 py-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
			{/* Step 1: Service Selection */}
			{step === 1 && <ServicesList services={services!} onSelectService={handleServiceSelect} />}

			{/* Step 2: Employee Selection */}
			{step === 2 && selectedService && (
				<div className="p-6 transition-all duration-300">
					<EmployeeList
						employees={employees}
						selectedService={selectedService.name}
						onSelectEmployee={handleEmployeeSelect}
						onBack={handleBack}
					/>
				</div>
			)}

			{/* Step 3: Booking Calendar */}
			{step === 3 && selectedEmployee && selectedService && (
				<div className="p-6 transition-all duration-300">
					<BookingCalendar
						selectedEmployee={selectedEmployee}
						selectedDuration={parseInt(selectedService.duration)}
						onBack={handleBack}
						onBookAppointment={handleBookAppointment}
					/>
				</div>
			)}
		</main>
	);
};

export default BookingProcess;
