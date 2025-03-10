import { NavLink } from "react-router-dom";
import { Calendar, User, CalendarCheck, Clock, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const CustomerSidebar = () => {
	const { logout } = useAuth();

	return (
		<div className="bg-gray-800 text-white w-64 flex flex-col h-full">
			<div className="p-4 flex items-center space-x-2">
				<Calendar className="h-8 w-8 text-blue-400" />
				<h1 className="text-xl font-bold">Customer Portal</h1>
			</div>

			<nav className="flex-1 px-2 py-4">
				<NavLink
					to="/customer-portal"
					end
					className={({ isActive }) =>
						`flex items-center px-4 py-2 mt-2 rounded-md ${
							isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
						}`
					}>
					<User className="h-5 w-5 mr-3" />
					My Profile
				</NavLink>

				<NavLink
					to="/customer-portal/book"
					className={({ isActive }) =>
						`flex items-center px-4 py-2 mt-2 rounded-md ${
							isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
						}`
					}>
					<Calendar className="h-5 w-5 mr-3" />
					Book Appointment
				</NavLink>

				<NavLink
					to="/customer-portal/appointments"
					className={({ isActive }) =>
						`flex items-center px-4 py-2 mt-2 rounded-md ${
							isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
						}`
					}>
					<CalendarCheck className="h-5 w-5 mr-3" />
					My Appointments
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
						<p className="text-gray-300">Need Help?</p>
						<p className="text-gray-400 text-xs">support@scheduler.com</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CustomerSidebar;
