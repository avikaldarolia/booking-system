import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// Pages
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Schedule from "./pages/Schedule";
import Settings from "./pages/Settings";
import EmployeeDetail from "./pages/EmployeeDetail";
import WeeklyStats from "./pages/WeeklyStats";
import CustomerBooking from "./pages/CustomerBooking";
import EmployeePortal from "./pages/EmployeePortal";
import CustomerPortal from "./pages/CustomerPortal";
import Login from "./pages/Login";

// Components
// import ManagerSidebar from "./components/ManagerSidebar";
// import EmployeeSidebar from "./components/EmployeeSidebar";
// import CustomerSidebar from "./components/CustomerSidebar";
import Header from "./components/Header";

// Context
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { RoleBasedRenderHash } from "./utils/utils";

interface PrivateRouteProps {
	children: React.ReactNode;
	allowedRoles: string[];
}

// const RoleBasedRenderHash = {
// 	associate: { page: <EmployeePortal />, sidebar: <EmployeeSidebar />, defaultRoute: "/employee" },
// 	part_time: { page: <EmployeePortal />, sidebar: <EmployeeSidebar />, defaultRoute: "/employee" },
// 	manager: { page: <Dashboard />, sidebar: <ManagerSidebar />, defaultRoute: "/" },
// 	customer: { page: <CustomerPortal />, sidebar: <CustomerSidebar />, defaultRoute: "/customer" },
// };

function PrivateRoute({ children, allowedRoles }: PrivateRouteProps) {
	const { user } = useAuth();

	if (!user) return <Navigate to="/login" replace />;

	if (!allowedRoles.includes(user.role)) {
		const defaultRoute = RoleBasedRenderHash[user.role]?.route || "/login";
		return <Navigate to={defaultRoute} replace />;
	}

	return children;
}
function AppContent() {
	const { user } = useAuth();

	// const getSidebar = () => {
	// 	switch (user?.role) {
	// 		case "manager":
	// 			return <ManagerSidebar />;
	// 		case "associate":
	// 			return <EmployeeSidebar />;
	// 		case "customer":
	// 			return <CustomerSidebar />;
	// 		default:
	// 			return null;
	// 	}
	// };

	const getSidebar = () => (user?.role ? RoleBasedRenderHash[user.role]?.sidebar() || null : null);

	return (
		<div className="flex h-screen bg-gray-100">
			{user && getSidebar()}
			<div className="flex-1 flex flex-col overflow-hidden">
				{user && <Header />}
				<main className="flex-1 overflow-y-auto p-4">
					<Routes>
						{/* Public Routes */}
						<Route path="/login" element={<Login />} />
						<Route path="/book/:employeeId" element={<CustomerBooking />} />

						{/* Manager Routes */}
						<Route
							path="/"
							element={
								<PrivateRoute allowedRoles={["manager"]}>
									<Dashboard />
								</PrivateRoute>
							}
						/>
						<Route
							path="/employees"
							element={
								<PrivateRoute allowedRoles={["manager"]}>
									<Employees />
								</PrivateRoute>
							}
						/>
						<Route
							path="/employees/:id"
							element={
								<PrivateRoute allowedRoles={["manager"]}>
									<EmployeeDetail />
								</PrivateRoute>
							}
						/>
						<Route
							path="/schedule"
							element={
								<PrivateRoute allowedRoles={["manager"]}>
									<Schedule />
								</PrivateRoute>
							}
						/>
						<Route
							path="/weekly-stats"
							element={
								<PrivateRoute allowedRoles={["manager"]}>
									<WeeklyStats />
								</PrivateRoute>
							}
						/>
						<Route
							path="/settings"
							element={
								<PrivateRoute allowedRoles={["manager"]}>
									<Settings />
								</PrivateRoute>
							}
						/>

						{/* Employee Routes */}
						<Route
							path="/employee-portal"
							element={
								<PrivateRoute allowedRoles={["associate", "part_time"]}>
									<EmployeePortal />
								</PrivateRoute>
							}
						/>

						{/* Customer Routes */}
						<Route
							path="/customer-portal"
							element={
								<PrivateRoute allowedRoles={["customer"]}>
									<CustomerPortal />
								</PrivateRoute>
							}
						/>

						{/* Catch-all for unauthorized users */}
						<Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
					</Routes>
				</main>
			</div>
		</div>
	);
}

export default function App() {
	return (
		<AuthProvider>
			<Router>
				<AppContent />
			</Router>
		</AuthProvider>
	);
}
