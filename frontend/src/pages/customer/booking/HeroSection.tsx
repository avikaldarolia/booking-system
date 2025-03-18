import React from "react";

interface HeroSectionProps {
	onBookNow: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onBookNow }) => {
	return (
		<div
			className="relative h-[600px] bg-cover bg-center"
			style={{
				backgroundImage:
					"url(https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2000&q=80)",
			}}>
			<div className="absolute inset-0 bg-black bg-opacity-50" />
			<div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
				<h1 className="text-5xl font-bold mb-6">Elevate Your Style</h1>
				<p className="text-xl mb-8 max-w-2xl">
					Experience the art of hair transformation with our expert stylists. Book your appointment today and discover
					your perfect look.
				</p>
				<button
					onClick={onBookNow}
					className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition duration-300">
					Book Now
				</button>
			</div>
		</div>
	);
};

export default HeroSection;
