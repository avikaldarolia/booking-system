import { NavLink } from "react-router-dom";
import { Calendar, Users, BarChart2, Settings, Home, Clock, CalendarCheck } from "lucide-react";

const ManagerSidebar = () => {
	return (
		<div className="bg-gray-800 text-white w-64 flex flex-col h-full">
			<div className="p-4 flex items-center space-x-2">
				<Calendar className="h-8 w-8 text-blue-400" />
				<h1 className="text-xl font-bold">Shift Scheduler</h1>
			</div>

			<nav className="flex-1 px-2 py-4">
				<NavLink
					to="/"
					className={({ isActive }) =>
						`flex items-center px-4 py-2 mt-2 rounded-md ${
							isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
						}`
					}>
					<Home className="h-5 w-5 mr-3" />
					Dashboard
				</NavLink>

				<NavLink
					to="/employees"
					className={({ isActive }) =>
						`flex items-center px-4 py-2 mt-2 rounded-md ${
							isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
						}`
					}>
					<Users className="h-5 w-5 mr-3" />
					Employees
				</NavLink>

				<NavLink
					to="/schedule"
					className={({ isActive }) =>
						`flex items-center px-4 py-2 mt-2 rounded-md ${
							isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
						}`
					}>
					<Calendar className="h-5 w-5 mr-3" />
					Schedule
				</NavLink>

				<NavLink
					to="/reservations"
					className={({ isActive }) =>
						`flex items-center px-4 py-2 mt-2 rounded-md ${
							isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
						}`
					}>
					<CalendarCheck className="h-5 w-5 mr-3" />
					Reservations
				</NavLink>

				<NavLink
					to="/weekly-stats"
					className={({ isActive }) =>
						`flex items-center px-4 py-2 mt-2 rounded-md ${
							isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
						}`
					}>
					<BarChart2 className="h-5 w-5 mr-3" />
					Weekly Stats
				</NavLink>

				<NavLink
					to="/settings"
					className={({ isActive }) =>
						`flex items-center px-4 py-2 mt-2 rounded-md ${
							isActive ? "bg-gray-700 text-white" : "text-gray-300 hover:bg-gray-700"
						}`
					}>
					<Settings className="h-5 w-5 mr-3" />
					Settings
				</NavLink>
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

export default ManagerSidebar;
