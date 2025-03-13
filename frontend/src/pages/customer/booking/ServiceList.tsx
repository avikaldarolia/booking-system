import React from "react";
import { Scissors } from "lucide-react";
import { Service } from "../../../types";

interface ServicesListProps {
	services: Service[];
	onSelectService: (service: Service) => void;
}

const ServicesList: React.FC<ServicesListProps> = ({ services, onSelectService }) => {
	return (
		<div className="py-16 max-w-7xl mx-auto px-4">
			<h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Services</h2>
			<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
				{services.map((service, index) => (
					<div
						key={index}
						className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-200 cursor-pointer border border-gray-100"
						onClick={() => onSelectService(service)}>
						<div className="flex items-center justify-between mb-4">
							<h3 className="text-xl font-semibold text-gray-800">{service.name}</h3>
							<Scissors className="h-6 w-6 text-blue-500" />
						</div>
						<p className="text-gray-600 text-base mb-4">{service.description}</p>
						<div className="flex items-center justify-between text-sm">
							<span className="text-blue-500 font-semibold">${service.price}</span>
							<span className="text-gray-500">{service.duration}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ServicesList;
