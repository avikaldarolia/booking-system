import React from "react";

const HeroSection: React.FC = () => {
	return (
		<div
			className="relative h-[600px] bg-cover bg-center"
			style={{
				backgroundImage:
					"url(https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2000&q=80)",
			}}>
			<div className="absolute inset-0 bg-black bg-opacity-50" />
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="text-center text-white px-4">
					<h1 className="text-5xl font-bold mb-6">Elevate Your Style</h1>
					<p className="text-xl mb-8 max-w-2xl">
						Experience the art of hair transformation with our expert stylists. Book your appointment today and discover
						your perfect look.
					</p>
				</div>
			</div>
		</div>
	);
};

export default HeroSection;
