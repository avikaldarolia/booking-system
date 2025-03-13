import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CustomerLogin: React.FC = () => {
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const navigate = useNavigate();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// API call
		return;
		if (email && phone) {
			navigate("/customer-portal");
		}
	};

	return (
		<div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
			<h2 className="text-2xl font-bold mb-6 text-gray-800">Customer Login</h2>
			<form onSubmit={handleSubmit}>
				<div className="mb-4">
					<label htmlFor="email" className="block text-gray-700 mb-2">
						Email
					</label>
					<input
						type="email"
						id="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>
				<div className="mb-6">
					<label htmlFor="phone" className="block text-gray-700 mb-2">
						Phone
					</label>
					<input
						type="tel"
						id="phone"
						value={phone}
						onChange={(e) => setPhone(e.target.value)}
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						required
					/>
				</div>
				<button
					type="submit"
					className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300">
					Login
				</button>
			</form>
		</div>
	);
};

export default CustomerLogin;
