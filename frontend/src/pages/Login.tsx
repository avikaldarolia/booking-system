import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, User, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { RoleBasedRenderHash } from "../utils/utils";

const Login = () => {
	const navigate = useNavigate();
	const { user, login } = useAuth();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (user) {
			const route = RoleBasedRenderHash[user.role].route;
			navigate(route);
		}
	}, [user, navigate]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		try {
			await login(email, password);
			if (user) {
				const route = RoleBasedRenderHash[user.role].route;
				navigate(route);
			} else {
				navigate("/");
			}
		} catch (error) {
			console.log("Error: ", error);
			setError("Failed to log in. Please check your credentials.");
		}

		setLoading(false);
	};

	return (
		<div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="flex justify-center">
					<Calendar className="h-12 w-12 text-blue-500" />
				</div>
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					{error && (
						<div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>
					)}

					<form className="space-y-6" onSubmit={handleSubmit}>
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700">
								Email address
							</label>
							<div className="mt-1 relative rounded-md shadow-sm">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<User className="h-5 w-5 text-gray-400" />
								</div>
								<input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
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
									autoComplete="current-password"
									required
									className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center">
								<input
									id="remember-me"
									name="remember-me"
									type="checkbox"
									className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
								/>
								<label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
									Remember me
								</label>
							</div>

							<div className="text-sm">
								<a href="#" className="font-medium text-blue-600 hover:text-blue-500">
									Forgot your password?
								</a>
							</div>
						</div>

						<div>
							<button
								type="submit"
								disabled={loading}
								className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
									loading
										? "bg-gray-400 cursor-not-allowed"
										: "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
								}`}>
								{loading ? "Signing in..." : "Sign in"}
							</button>
						</div>
					</form>

					<div className="mt-6">
						<div className="relative">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-gray-300" />
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-white text-gray-500">Or continue with</span>
							</div>
						</div>

						<div className="mt-6 grid grid-cols-2 gap-3">
							<button
								type="button"
								className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
								Customer Sign Up
							</button>

							<button
								type="button"
								className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
								Employee Portal
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
