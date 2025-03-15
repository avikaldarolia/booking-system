import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import Spinner from "../../../components/Spinner";
import Footer from "../../../components/Footer";
import HeroSection from "./HeroSection";
import ServicesList from "./ServiceList";
import EmployeeList from "./EmployeeList";
import BookingCalendar from "./BookingCalendar";
import { Service, Employee, Customer } from "../../../types";
import CustomerHeader from "../../../components/CustomerHeader";

const services: Service[] = [
	{
		name: "Haircut & Styling",
		price: 45,
		duration: "45 min",
		description: "Professional haircut and styling tailored to your preferences",
	},
	{
		name: "Color & Highlights",
		price: 85,
		duration: "120 min",
		description: "Full color or highlights using premium products",
	},
	{
		name: "Blowout & Treatment",
		price: 55,
		duration: "60 min",
		description: "Luxurious hair treatment with professional blowout",
	},
	{
		name: "Special Occasion",
		price: 75,
		duration: "90 min",
		description: "Elegant styling for weddings, events, and special occasions",
	},
];

const BookingFlow = () => {
	const [step, setStep] = useState(1);
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
	const [selectedService, setSelectedService] = useState<Service | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchEmployees = async () => {
			try {
				const response = await axios.get("employees");
				setEmployees(response.data);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching employees:", error);
				setLoading(false);
			}
		};
		fetchEmployees();
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
		if (!selectedEmployee || !selectedSlot || !selectedDate) return;

		try {
			await axios.post("reservations", {
				employeeId: selectedEmployee.id,
				date: format(selectedDate, "yyyy-MM-dd"),
				startTime: selectedSlot,
				duration: selectedService?.duration.split(" ")[0],
				email: customer.email,
				phone: customer.phoneNumber,
				name: customer.name || "",
				notes,
			});
			alert("Appointment booked successfully!");
			setStep(1);
			setSelectedEmployee(null);
			setSelectedService(null);
		} catch (error) {
			console.error("Error booking appointment:", error);
			alert("Failed to book appointment. Please try again.");
		}
	};

	if (loading) return <Spinner />;

	return (
		<div className="flex flex-col min-h-screen bg-white">
			<CustomerHeader />
			{/* Hero section & services list */}
			{!selectedService && step === 1 && (
				<>
					<HeroSection />
					<ServicesList services={services} onSelectService={handleServiceSelect} />
				</>
			)}

			{/* Main content wrapper */}
			<main className="flex-1 py-16 px-4 max-w-7xl mx-auto">
				{step === 2 && selectedService && (
					<EmployeeList
						employees={employees}
						selectedService={selectedService.name}
						onSelectEmployee={handleEmployeeSelect}
						onBack={handleBack}
					/>
				)}
				{step === 3 && selectedEmployee && selectedService && (
					<BookingCalendar
						selectedEmployee={selectedEmployee}
						selectedDuration={parseInt(selectedService.duration.split(" ")[0])}
						onBack={handleBack}
						onBookAppointment={handleBookAppointment}
					/>
				)}
			</main>

			<Footer />
		</div>
	);
};

export default BookingFlow;
