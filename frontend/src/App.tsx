import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/manager/Dashboard";
import Employees from "./pages/manager/Employees";
import Schedule from "./pages/manager/Schedule";
import Settings from "./pages/manager/Settings";
import EmployeeDetail from "./pages/manager/EmployeeDetail";
import WeeklyStats from "./pages/manager/WeeklyStats";
import CustomerBooking from "./pages/customer/CustomerBooking";
import EmployeePortal from "./pages/employee-portal/EmployeePortal";
import CustomerPortal from "./pages/customer/CustomerPortal";
import Login from "./pages/Login";

// Components
import Header from "./components/Header";

// Context
import { useAuth } from "./contexts/AuthContext";
import { AuthProvider } from "./contexts/AuthProvider";

// Utils
import { RoleBasedRenderHash } from "./utils/utils";
import EmployeeAvailability from "./pages/employee-portal/Availability";
import EmployeeReservations from "./pages/employee-portal/Reservations";
import EmployeeSchedule from "./pages/employee-portal/Schedule";
import { User } from "./types";

interface PrivateRouteProps {
	children: React.ReactNode;
	allowedRoles: string[];
	user: User | null;
}

function PrivateRoute({ user, children, allowedRoles }: PrivateRouteProps) {
	if (!user) return <Navigate to="/login" replace />;

	if (!allowedRoles.includes(user.role)) {
		const defaultRoute = RoleBasedRenderHash[user.role].route;
		return <Navigate to={defaultRoute} replace />;
	}

	return children;
}
function AppContent() {
	const { user }: { user: User | null } = useAuth();
	const sidebar = user?.role ? RoleBasedRenderHash[user.role]?.sidebar() : null;

	return (
		<div className="flex h-screen bg-gray-100">
			{user && sidebar}
			<div className="flex-1 flex flex-col overflow-hidden">
				{user && <Header />}
				<main className="flex-1 overflow-y-auto p-4">
					<Routes>
						{/* Public Routes */}
						<Route path="/login" element={<Login />} />
						<Route path="/book/:employeeId" element={<CustomerBooking />} />

						{/* Manager Routes */}
						<Route
							path="/manager-portal/*"
							element={
								<PrivateRoute user={user} allowedRoles={["manager"]}>
									<Routes>
										<Route path="" element={<Dashboard />} />
										<Route path="employees" element={<Employees />} />
										<Route path="employee/:id" element={<EmployeeDetail />} />
										<Route path="schedule" element={<Schedule />} />
										<Route path="weekly-stats" element={<WeeklyStats />} />
										<Route path="settings" element={<Settings />} />
										<Route path="*" element={<Navigate to="/manager-portal/" replace />} />
									</Routes>
								</PrivateRoute>
							}
						/>

						{/* Employee Routes */}
						<Route
							path="/employee-portal/*"
							element={
								<PrivateRoute user={user} allowedRoles={["associate", "part_time"]}>
									<Routes>
										<Route path="" element={<EmployeePortal />} />
										{/* Add emp detail page as well. */}
										<Route path="availability" element={<EmployeeAvailability />} />
										<Route path="reservations" element={<EmployeeReservations />} />
										<Route path="schedule" element={<EmployeeSchedule />} />
										<Route path="*" element={<Navigate to="/employee-portal/" replace />} />
									</Routes>
								</PrivateRoute>
							}
						/>

						{/* Customer Routes */}
						<Route
							path="/customer-portal/*"
							element={
								<PrivateRoute user={user} allowedRoles={["customer"]}>
									<CustomerPortal />
								</PrivateRoute>
							}
						/>

						{/* Catch-all for unauthorized users */}
						<Route
							path="*"
							element={<Navigate to={user ? RoleBasedRenderHash[user.role].route : "/login"} replace />}
						/>
					</Routes>
				</main>
			</div>
		</div>
	);
}

export default function App() {
	return (
		<Router>
			<AuthProvider>
				<AppContent />
			</AuthProvider>
		</Router>
	);
}
