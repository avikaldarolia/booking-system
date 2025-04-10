import React from "react";
import { Scissors } from "lucide-react";
import { Service } from "../../../types";

interface ServicesListProps {
	services: Service[];
	onSelectService: (service: Service) => void;
}

const ServicesList: React.FC<ServicesListProps> = ({ services, onSelectService }) => {
	return (
		<div className="py-12 px-6">
			<h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Our Services</h2>
			<div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{services?.map((service) => (
					<div
						key={service.id}
						className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-transform transform hover:-translate-y-1 cursor-pointer border border-gray-200 flex flex-col"
						onClick={() => onSelectService(service)}>
						<div className="flex min-h-[60px]">
							<h3 className="text-xl w-11/12 inline-block font-semibold text-gray-800">{service.name}</h3>
							<Scissors className="h-6 w-6 text-blue-600" />
						</div>

						<p className="text-gray-600 text-base flex-grow my-2 overflow-hidden">{service.description}</p>

						<div className="mt-auto flex items-center h-fit justify-between text-sm font-medium border-t border-gray-200">
							<span className="text-blue-600 text-lg font-bold">${service.price}</span>
							<span className="text-gray-500">{service.duration}</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ServicesList;
