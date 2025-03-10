import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, User, Lock, Mail, Phone } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

type FormType = "employee" | "customerLogin" | "customerSignup";

interface CustomerSignupData {
	name: string;
	email: string;
	phone: string;
	password: string;
}

const Login = () => {
	const navigate = useNavigate();
	const { login } = useAuth();

	const [activeForm, setActiveForm] = useState<FormType>("customerLogin");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const [customerSignup, setCustomerSignup] = useState<CustomerSignupData>({
		name: "",
		email: "",
		phone: "",
		password: "",
	});

	const handleEmployeeLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await login(email, password);
		} catch (error) {
			console.log(error);
			setError("Failed to log in. Please check your credentials.");
		}

		setLoading(false);
	};

	const handleCustomerLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await login(email, password);
			navigate("/customer-portal");
		} catch (error) {
			console.log(error);
			setError("Failed to log in. Please check your credentials.");
		}

		setLoading(false);
	};

	const handleCustomerSignup = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await axios.post("auth/signup", customerSignup);
			await login(customerSignup.email, customerSignup.password);
			navigate("/customer-portal");
		} catch (error) {
			console.log(error);
			setError("Failed to create account. Please try again.");
		}

		setLoading(false);
	};

	const renderEmployeeForm = () => (
		<form onSubmit={handleEmployeeLogin} className="space-y-6">
			<div>
				<label htmlFor="email" className="block text-sm font-medium text-gray-700">
					Email address
				</label>
				<div className="mt-1 relative rounded-md shadow-sm">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Mail className="h-5 w-5 text-gray-400" />
					</div>
					<input
						id="email"
						name="email"
						type="email"
						required
						className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
			</div>

			<div>
				<label htmlFor="password" className="block text-sm font-medium text-gray-700">
					Password
				</label>
				<div className="mt-1 relative rounded-md shadow-sm">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Lock className="h-5 w-5 text-gray-400" />
					</div>
					<input
						id="password"
						name="password"
						type="password"
						required
						className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
					loading
						? "bg-gray-400 cursor-not-allowed"
						: "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				}`}>
				{loading ? "Signing in..." : "Sign in as Employee"}
			</button>
		</form>
	);

	const renderCustomerLoginForm = () => (
		<form onSubmit={handleCustomerLogin} className="space-y-6">
			<div>
				<label htmlFor="email" className="block text-sm font-medium text-gray-700">
					Email address
				</label>
				<div className="mt-1 relative rounded-md shadow-sm">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Mail className="h-5 w-5 text-gray-400" />
					</div>
					<input
						id="email"
						name="email"
						type="email"
						required
						className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
						placeholder="you@example.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
					/>
				</div>
			</div>

			<div>
				<label htmlFor="password" className="block text-sm font-medium text-gray-700">
					Password
				</label>
				<div className="mt-1 relative rounded-md shadow-sm">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Lock className="h-5 w-5 text-gray-400" />
					</div>
					<input
						id="password"
						name="password"
						type="password"
						required
						className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
						placeholder="••••••••"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
					loading
						? "bg-gray-400 cursor-not-allowed"
						: "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				}`}>
				{loading ? "Signing in..." : "Sign in as Customer"}
			</button>

			<div className="text-center">
				<button
					type="button"
					onClick={() => setActiveForm("customerSignup")}
					className="text-sm text-blue-600 hover:text-blue-500">
					Don't have an account? Sign up
				</button>
			</div>
		</form>
	);

	const renderCustomerSignupForm = () => (
		<form onSubmit={handleCustomerSignup} className="space-y-6">
			<div>
				<label htmlFor="name" className="block text-sm font-medium text-gray-700">
					Full Name
				</label>
				<div className="mt-1 relative rounded-md shadow-sm">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<User className="h-5 w-5 text-gray-400" />
					</div>
					<input
						id="name"
						name="name"
						type="text"
						required
						className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
						placeholder="John Doe"
						value={customerSignup.name}
						onChange={(e) => setCustomerSignup({ ...customerSignup, name: e.target.value })}
					/>
				</div>
			</div>

			<div>
				<label htmlFor="email" className="block text-sm font-medium text-gray-700">
					Email address
				</label>
				<div className="mt-1 relative rounded-md shadow-sm">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Mail className="h-5 w-5 text-gray-400" />
					</div>
					<input
						id="email"
						name="email"
						type="email"
						required
						className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
						placeholder="you@example.com"
						value={customerSignup.email}
						onChange={(e) => setCustomerSignup({ ...customerSignup, email: e.target.value })}
					/>
				</div>
			</div>

			<div>
				<label htmlFor="phone" className="block text-sm font-medium text-gray-700">
					Phone Number
				</label>
				<div className="mt-1 relative rounded-md shadow-sm">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Phone className="h-5 w-5 text-gray-400" />
					</div>
					<input
						id="phone"
						name="phone"
						type="tel"
						required
						className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
						placeholder="(123) 456-7890"
						value={customerSignup.phone}
						onChange={(e) => setCustomerSignup({ ...customerSignup, phone: e.target.value })}
					/>
				</div>
			</div>

			<div>
				<label htmlFor="password" className="block text-sm font-medium text-gray-700">
					Password
				</label>
				<div className="mt-1 relative rounded-md shadow-sm">
					<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
						<Lock className="h-5 w-5 text-gray-400" />
					</div>
					<input
						id="password"
						name="password"
						type="password"
						required
						className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
						placeholder="••••••••"
						value={customerSignup.password}
						onChange={(e) => setCustomerSignup({ ...customerSignup, password: e.target.value })}
					/>
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
					loading
						? "bg-gray-400 cursor-not-allowed"
						: "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
				}`}>
				{loading ? "Creating Account..." : "Create Account"}
			</button>

			<div className="text-center">
				<button
					type="button"
					onClick={() => setActiveForm("customerLogin")}
					className="text-sm text-blue-600 hover:text-blue-500">
					Already have an account? Sign in
				</button>
			</div>
		</form>
	);

	return (
		<div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="flex justify-center">
					<Calendar className="h-12 w-12 text-blue-500" />
				</div>
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					{activeForm === "customerSignup" ? "Create your account" : "Sign in to your account"}
				</h2>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					{error && (
						<div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>
					)}

					{activeForm === "employee" && renderEmployeeForm()}
					{activeForm === "customerLogin" && renderCustomerLoginForm()}
					{activeForm === "customerSignup" && renderCustomerSignupForm()}

					{activeForm !== "employee" && (
						<div className="mt-6">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-white text-gray-500">Or</span>
								</div>
							</div>

							<div className="mt-6">
								<button
									type="button"
									onClick={() => setActiveForm("employee")}
									className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
									Employee Portal
								</button>
							</div>
						</div>
					)}

					{activeForm === "employee" && (
						<div className="mt-6">
							<div className="relative">
								<div className="absolute inset-0 flex items-center">
									<div className="w-full border-t border-gray-300" />
								</div>
								<div className="relative flex justify-center text-sm">
									<span className="px-2 bg-white text-gray-500">Or</span>
								</div>
							</div>

							<div className="mt-6">
								<button
									type="button"
									onClick={() => setActiveForm("customerLogin")}
									className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
									Customer Portal
								</button>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Login;
