import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ManagerDashboard from "./pages/ManagerDashboard";

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
						</Routes>
					</main>
				</div>
			</div>
		</Router>
	);
}

export default App;
