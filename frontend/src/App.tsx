import { BrowserRouter as Router, Route, Navigate, Routes } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import { AuthProvider } from "./contexts/AuthProvider";
import { RoleBasedRenderHash } from "./utils/utils";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Public Pages
import Login from "./pages/Login";
import CustomerLogin from "./pages/customer/CustomerLogin";
import BookingFlow from "./pages/customer/booking/BookingFlow";

// Manager Pages
import Dashboard from "./pages/manager/Dashboard";
import Employees from "./pages/manager/Employees";
import EmployeeDetail from "./pages/manager/EmployeeDetail";
import Schedule from "./pages/manager/Schedule";
import WeeklyStats from "./pages/manager/WeeklyStats";
import Reservations from "./pages/manager/Reservations";
import Settings from "./pages/manager/Settings";

// Employee Pages
import EmployeePortal from "./pages/employee-portal/EmployeePortal";
import EmployeeAvailability from "./pages/employee-portal/Availability";
import EmployeeReservations from "./pages/employee-portal/Reservations";
import EmployeeSchedule from "./pages/employee-portal/Schedule";

// Customer Pages
import CustomerPortal from "./pages/customer/CustomerPortal";
import { User } from "./types";
import Spinner from "./components/Spinner";

interface PrivateRouteProps {
	children: React.ReactNode;
	allowedRoles: string[];
	user: User | null;
}

function PrivateRoute({ user, children, allowedRoles }: PrivateRouteProps) {
	if (!user) return <Navigate to="/book" replace />;
	if (!user.role) return <Navigate to="/login" replace />;

	if (!allowedRoles.includes(user.role)) {
		const defaultRoute = RoleBasedRenderHash[user.role]?.route || "/login";
		return <Navigate to={defaultRoute} replace />;
	}

	return children;
}

function AppRoutes() {
	const { user, loading }: { user: User | null; loading: boolean } = useAuth();

	if (loading) {
		return <Spinner />;
	}

	return (
		<Routes>
			{/* Public Routes (Only for Logged-Out Users) */}
			<Route element={<PublicLayout />}>
				<Route path="/employee-login" element={<Login />} />
				<Route path="/login" element={<CustomerLogin />} />
				<Route path="/book" element={<BookingFlow />} />
			</Route>

			{/* Manager Routes */}
			<Route
				path="/manager-portal/*"
				element={
					<PrivateRoute user={user} allowedRoles={["manager"]}>
						<DashboardLayout>
							<Routes>
								<Route path="" element={<Dashboard />} />
								<Route path="employees" element={<Employees />} />
								<Route path="employee/:id" element={<EmployeeDetail />} />
								<Route path="schedule" element={<Schedule />} />
								<Route path="weekly-stats" element={<WeeklyStats />} />
								<Route path="reservations" element={<Reservations />} />
								<Route path="settings" element={<Settings />} />
								<Route path="*" element={<Navigate to="/manager-portal/" replace />} />
							</Routes>
						</DashboardLayout>
					</PrivateRoute>
				}
			/>

			{/* Employee Routes */}
			<Route
				path="/employee-portal/*"
				element={
					<PrivateRoute user={user} allowedRoles={["associate", "part_time"]}>
						<DashboardLayout>
							<Routes>
								<Route path="" element={<EmployeePortal />} />
								<Route path="availability" element={<EmployeeAvailability />} />
								<Route path="reservations" element={<EmployeeReservations />} />
								<Route path="schedule" element={<EmployeeSchedule />} />
								<Route path="*" element={<Navigate to="/employee-portal/" replace />} />
							</Routes>
						</DashboardLayout>
					</PrivateRoute>
				}
			/>

			{/* Customer Routes */}
			<Route
				path="/customer-portal/*"
				element={
					<PrivateRoute user={user} allowedRoles={["customer"]}>
						<DashboardLayout>
							<CustomerPortal />
						</DashboardLayout>
					</PrivateRoute>
				}
			/>

			{/* Default Redirect Based on Role */}
			<Route
				path="*"
				element={<Navigate to={user ? RoleBasedRenderHash[user.role].route : "/employee-login"} replace />}
			/>
		</Routes>
	);
}

export default function App() {
	return (
		<Router>
			<AuthProvider>
				<AppRoutes />
			</AuthProvider>
		</Router>
	);
}
