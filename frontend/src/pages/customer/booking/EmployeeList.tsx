import React from "react";
import { Star, ChevronLeft } from "lucide-react";
import { Employee } from "../../../types";

interface EmployeeListProps {
	employees: Employee[];
	selectedService: string;
	onSelectEmployee: (employee: Employee) => void;
	onBack: () => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ employees, selectedService, onSelectEmployee, onBack }) => {
	return (
		<div className="max-w-6xl mx-auto">
			{/* Back Button */}
			<div className="flex items-center mb-10">
				<button
					onClick={onBack}
					className="mr-4 text-blue-600 hover:text-blue-700 bg-white shadow-md p-2 rounded-full transition-all duration-300 hover:scale-110">
					<ChevronLeft className="h-6 w-6" />
				</button>
				<h2 className="text-4xl font-bold text-gray-900">Choose Your Stylist for {selectedService}</h2>
			</div>

			{/* Employee Cards */}
			<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
				{employees?.map((employee) => (
					<div
						key={employee.id}
						className="bg-white backdrop-blur-lg bg-opacity-80 shadow-xl rounded-xl overflow-hidden cursor-pointer border border-gray-300 hover:scale-105 transition-transform duration-300 hover:shadow-2xl"
						onClick={() => onSelectEmployee(employee)}>
						{/* Image */}
						<div className="relative overflow-hidden">
							<img
								src={employee.imageUrl}
								alt={employee.name}
								className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
							/>
							{/* Gradient Overlay */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
						</div>

						{/* Details */}
						<div className="p-6">
							<div className="flex justify-between items-center">
								<div>
									<h3 className="text-2xl font-semibold text-gray-800">{employee.name}</h3>
									<p className="text-gray-500 text-sm">{employee.specialties}</p>
								</div>
								{/* Rating Badge */}
								<div className="flex items-center bg-yellow-100 px-3 py-1 rounded-lg shadow-sm">
									<Star className="h-5 w-5 text-yellow-500" />
									<span className="ml-1 text-gray-700 text-sm font-medium">{employee.rating}</span>
								</div>
							</div>
							<p className="text-blue-600 font-semibold text-lg mt-4">${employee.hourlyRate}/hr</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default EmployeeList;
