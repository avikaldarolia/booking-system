import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { formatPhoneNumber, RoleBasedRenderHash } from "../../utils/utils";
import { Mail, Phone } from "lucide-react";

const CustomerLogin: React.FC = () => {
	const { user, login } = useAuth();
	const [email, setEmail] = useState("");
	const [phone, setPhone] = useState("");
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (user && !loading) {
			const defaultRoute = RoleBasedRenderHash[user.role]?.route || "/employee-login";
			navigate(defaultRoute, { replace: true });
		}
	}, [user, loading, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await login(email, "", phone);
		} catch (error) {
			console.log(error);
			alert("Failed to log in. Please check your credentials.");
		} finally {
			setLoading(false);
		}
	};

	const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatPhoneNumber(e.target.value);
		setPhone(formatted);
	};

	return (
		<div className="max-w-xl w-4/5 mx-auto mt-8 py-10 px-6 bg-white rounded-lg shadow-md">
			<h2 className="text-2xl font-bold mb-6 text-gray-800">Customer Login</h2>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label htmlFor="email" className="block text-sm font-medium text-gray-700">
						Email address
					</label>
					<div className="my-2 relative rounded-md shadow-sm">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Mail className="h-5 w-5 text-gray-400" />
						</div>
						<input
							id="email"
							name="email"
							type="email"
							required
							className="focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 sm:text-sm border border-gray-300 rounded-md"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
						/>
					</div>
				</div>
				<div>
					<label htmlFor="phone" className="block text-sm font-medium text-gray-700">
						Phone Number
					</label>
					<div className="my-2 relative rounded-md shadow-sm">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Phone className="h-5 w-5 text-gray-400" />
						</div>
						<input
							type="text"
							value={phone}
							onChange={handlePhoneChange}
							className="focus:ring-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-3 sm:text-sm border border-gray-300 rounded-md"
							placeholder="XXX-XXX-XXXX"
							maxLength={12}
							required
						/>
					</div>
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
