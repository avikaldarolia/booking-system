import { Bell, Search, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext"; // Ensure correct path to AuthContext
import { useState } from "react";

const Header = () => {
	const { user, logout } = useAuth();
	const [dropdownOpen, setDropdownOpen] = useState(false);

	const toggleDropdown = () => {
		setDropdownOpen((prev) => !prev);
	};

	return (
		<header className="bg-white shadow-sm z-10">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between h-16">
					{/* Search Bar */}
					<div className="flex items-center">
						<div className="relative">
							<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Search className="h-5 w-5 text-gray-400" />
							</div>
							<input
								type="text"
								placeholder="Search..."
								className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
							/>
						</div>
					</div>

					{/* Notifications & User Dropdown */}
					<div className="flex items-center space-x-4">
						{/* Notification Bell */}
						<button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
							<Bell className="h-6 w-6" />
						</button>

						{/* User Profile */}
						<div className="relative px-4">
							<button
								onClick={toggleDropdown}
								className="flex items-center space-x-2 p-2 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none">
								<div className="h-8 w-8 rounded-full flex items-center justify-center">
									<User className="h-5 w-5 text-gray-600" />
								</div>
								<span className="text-sm font-medium text-gray-700">{user?.name || "Guest"}</span>
							</button>

							{/* Dropdown Menu */}
							{dropdownOpen && (
								<div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg py-2 z-20">
									<button
										onClick={logout}
										className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-100">
										Sign Out
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
