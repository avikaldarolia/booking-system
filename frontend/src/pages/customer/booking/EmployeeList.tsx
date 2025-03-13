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
		<div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 py-16 px-6">
			<div className="max-w-6xl mx-auto">
				<div className="flex items-center mb-10">
					<button
						onClick={onBack}
						className="mr-4 text-blue-600 hover:text-blue-700 hover:bg-blue-100 p-2 rounded-full transition-colors duration-200">
						<ChevronLeft className="h-6 w-6" />
					</button>
					<h2 className="text-4xl font-bold text-gray-900">Choose Your Stylist for {selectedService}</h2>
				</div>
				<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in">
					{employees.map((employee) => (
						<div
							key={employee.id}
							className="bg-white backdrop-blur-md bg-opacity-90 shadow-lg rounded-xl overflow-hidden cursor-pointer border border-gray-200 hover:scale-105 transition-transform duration-200 hover:shadow-xl"
							onClick={() => onSelectEmployee(employee)}>
							<img
								src={employee.imageUrl}
								alt={employee.name}
								className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
							/>
							<div className="p-6">
								<div className="flex justify-between items-center">
									<div>
										<h3 className="text-2xl font-semibold text-gray-800">{employee.name}</h3>
										<p className="text-gray-500 text-sm">{employee.specialties}</p>
									</div>
									<div className="flex items-center bg-yellow-100 px-2 py-1 rounded-lg">
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
		</div>
	);
};

export default EmployeeList;
