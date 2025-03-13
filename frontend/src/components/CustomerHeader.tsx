import React from "react";

const CustomerHeader: React.FC = () => {
	return (
		<header className="bg-white shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center py-4">
					<h1 className="text-2xl font-bold text-gray-800">Style Salon</h1>
					<nav>
						<a href="/login" className="text-blue-500 hover:text-blue-600 font-medium">
							Login
						</a>
					</nav>
				</div>
			</div>
		</header>
	);
};

export default CustomerHeader;
