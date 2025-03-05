import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ManagerDashboard from "./pages/ManagerDashboard";
import Employees from "./pages/Employee";
import EmployeeDetail from "./pages/EmployeeDetail";
import Schedule from "./pages/Schedule";
import WeeklyStats from "./pages/WeeklyStats";
import Settings from "./pages/Settings";

function App() {
	return (
		<Router>
			<div className="flex h-screen bg-gray-100">
				<Sidebar />
				<div className="flex-1 flex flex-col overflow-hidden">
					<Header />
					<main className="flex-1 overflow-y-auto p-4">
						<Routes>
							<Route path="/manager" element={<ManagerDashboard />} />
							<Route path="/employees" element={<Employees />} />
							<Route path="/employees/:id" element={<EmployeeDetail />} />
							<Route path="/schedule" element={<Schedule />} />
							<Route path="/weekly-stats" element={<WeeklyStats />} />
							<Route path="/settings" element={<Settings />} />
						</Routes>
					</main>
				</div>
			</div>
		</Router>
	);
}

export default App;
