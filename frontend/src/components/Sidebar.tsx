import { BarChart2, Calendar, Home, Settings, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
	return (
		<div className="bg-gray-800 text-white w-64 flex flex-col h-full">
			<div className="p-4 flex items-center space-x-2">
				<Calendar className="w-8 h-8 text-blue-400" />
				<p className="text-xl font-bold">Shift Scheduler</p>
			</div>
			<nav className="flex-1 px-2 py-4">
				<NavLink
					to="/manager"
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
		</div>
	);
};

export default Sidebar;
