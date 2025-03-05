import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

function App() {
	return (
		<Router>
			<div className="flex h-screen bg-gray-100">
				<Sidebar />
				<div className="flex-1 flex flex-col overflow-hidden">
					<Header />
					<main className="flex-1 overflow-y-auto p-4">
						<Routes>{/* <Route path="/" element={} /> */}</Routes>
					</main>
				</div>
			</div>
		</Router>
	);
}

export default App;
