import { NavLink } from "react-router-dom";
import { Calendar, Clock, CalendarCheck, User, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const EmployeeSidebar = () => {
	const { logout } = useAuth();

	return (
		<div className="bg-gray-800 text-white w-64 flex flex-col h-full">
			<div className="p-4 flex items-center space-x-2">
				<Calendar className="h-8 w-8 text-blue-400" />
				<h1 className="text-xl font-bold">Employee Portal</h1>
			</div>

			<nav className="flex-1 px-2 py-4">
				<NavLink
					to="/employee-portal"
					end
					className={({ isActive }) =>
						`flex items-center px-4 py-2 mt-2 rounded-md ${
							isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
						}`
					}>
					<User className="h-5 w-5 mr-3" />
					My Dashboard
				</NavLink>

				<NavLink
					to="/employee-portal/schedule"
					className={({ isActive }) =>
						`flex items-center px-4 py-2 mt-2 rounded-md ${
							isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
						}`
					}>
					<Calendar className="h-5 w-5 mr-3" />
					My Schedule
				</NavLink>

				<NavLink
					to="/employee-portal/availability"
					className={({ isActive }) =>
						`flex items-center px-4 py-2 mt-2 rounded-md ${
							isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
						}`
					}>
					<Clock className="h-5 w-5 mr-3" />
					Availability
				</NavLink>

				<NavLink
					to="/employee-portal/reservations"
					className={({ isActive }) =>
						`flex items-center px-4 py-2 mt-2 rounded-md ${
							isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
						}`
					}>
					<CalendarCheck className="h-5 w-5 mr-3" />
					My Reservations
				</NavLink>

				<button
					onClick={logout}
					className="flex items-center px-4 py-2 mt-2 rounded-md text-gray-300 hover:bg-gray-700 w-full">
					<LogOut className="h-5 w-5 mr-3" />
					Logout
				</button>
			</nav>

			<div className="p-4 border-t border-gray-700">
				<div className="flex items-center">
					<Clock className="h-5 w-5 mr-3 text-gray-400" />
					<div className="text-sm">
						<p className="text-gray-300">Current Week</p>
						<p className="text-gray-400 text-xs">
							{new Date().toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default EmployeeSidebar;
