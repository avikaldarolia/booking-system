import axios from "axios";
import { format } from "date-fns";
import { ArrowLeft, Calendar, Clock, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../../components/Spinner";

interface Employee {
	id: string;
	name: string;
	email: string;
	type: string;
	maxHours: number;
	currentHours: number;
	hourlyRate: number;
}

interface Availability {
	id: string;
	date: string;
	startTime: string;
	endTime: string;
	isBlocked: boolean;
	note: string;
}

const EmployeeDetail = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const [employee, setEmployee] = useState<Employee | null>(null);
	const [availabilities, setAvailabilities] = useState<Availability[]>([]);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [showAddAvailability, setShowAddAvailability] = useState(false);
	const [newAvailability, setNewAvailability] = useState({
		date: format(new Date(), "yyyy-MM-dd"),
		startTime: "09:00",
		endTime: "17:00",
		isBlocked: true,
		note: "",
	});

	useEffect(() => {
		const fetchEmployeeData = async () => {
			try {
				// Fetch employee details
				const employeeResponse = await axios.get(`employees/${id}`);
				setEmployee(employeeResponse.data);

				// Fetch employee availabilities
				const availabilityResponse = await axios.get(`availability/employee/${id}`);
				setAvailabilities(availabilityResponse.data);

				setLoading(false);
			} catch (error) {
				console.error("Error fetching employee data:", error);
			}
		};

		fetchEmployeeData();
	}, [id]);

	const handleSaveEmployee = async () => {
		if (!employee) return;

		try {
			await axios.put(`employees/${id}`, employee);
			setEditing(false);
		} catch (error) {
			console.error("Error updating employee:", error);
		}
	};

	const handleAddAvailability = async () => {
		try {
			const response = await axios.post("availability", {
				...newAvailability,
				employeeId: id,
			});

			setAvailabilities([...availabilities, response.data]);
			setShowAddAvailability(false);
			setNewAvailability({
				date: format(new Date(), "yyyy-MM-dd"),
				startTime: "09:00",
				endTime: "17:00",
				isBlocked: true,
				note: "",
			});
		} catch (error) {
			console.error("Error adding availability:", error);
		}
	};

	const handleDeleteAvailability = async (id: string) => {
		try {
			await axios.delete(`availability/${id}`);
			setAvailabilities(availabilities.filter((a) => a.id !== id));
		} catch (error) {
			console.error("Error deleting availability:", error);
		}
	};

	if (loading) {
		return <Spinner />;
	}

	if (!employee) {
		return (
			<div className="container mx-auto px-4 py-6">
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">Employee not found</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-6">
			<button
				onClick={() => navigate("/employees")}
				className="flex items-center text-blue-500 hover:text-blue-700 mb-4">
				<ArrowLeft className="h-4 w-4 mr-1" />
				Back to Employees
			</button>

			<div className="bg-white rounded-lg shadow overflow-hidden mb-6">
				<div className="p-6 border-b">
					<div className="flex justify-between items-center mb-4">
						<h1 className="text-2xl font-bold text-gray-800">Employee Details</h1>
						{editing ? (
							<button
								onClick={handleSaveEmployee}
								className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center">
								<Save className="h-5 w-5 mr-1" />
								Save Changes
							</button>
						) : (
							<button
								onClick={() => setEditing(true)}
								className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
								Edit
							</button>
						)}
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<div className="mb-4">
								<label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
								{editing ? (
									<input
										type="text"
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
										value={employee.name}
										onChange={(e) => setEmployee({ ...employee, name: e.target.value })}
									/>
								) : (
									<p className="text-gray-800">{employee.name}</p>
								)}
							</div>

							<div className="mb-4">
								<label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
								{editing ? (
									<input
										type="email"
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
										value={employee.email}
										onChange={(e) => setEmployee({ ...employee, email: e.target.value })}
									/>
								) : (
									<p className="text-gray-800">{employee.email}</p>
								)}
							</div>

							<div className="mb-4">
								<label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
								{editing ? (
									<select
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
										value={employee.type}
										onChange={(e) => setEmployee({ ...employee, type: e.target.value })}>
										<option value="manager">Manager</option>
										<option value="associate">Associate</option>
										<option value="part_time">Part Time</option>
									</select>
								) : (
									<p className="text-gray-800">
										{employee.type.charAt(0).toUpperCase() + employee.type.slice(1).replace("_", " ")}
									</p>
								)}
							</div>
						</div>

						<div>
							<div className="mb-4">
								<label className="block text-gray-700 text-sm font-bold mb-2">Max Hours</label>
								{editing ? (
									<input
										type="number"
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
										value={employee.maxHours}
										onChange={(e) => setEmployee({ ...employee, maxHours: parseInt(e.target.value) })}
									/>
								) : (
									<p className="text-gray-800">{employee.maxHours} hours/week</p>
								)}
							</div>

							<div className="mb-4">
								<label className="block text-gray-700 text-sm font-bold mb-2">Current Hours</label>
								<div className="flex items-center">
									<p className="text-gray-800 mr-2">{employee.currentHours} hours</p>
									<div className="flex-1 bg-gray-200 rounded-full h-2.5">
										<div
											className={`h-2.5 rounded-full ${
												employee.currentHours / employee.maxHours > 0.8 ? "bg-red-500" : "bg-blue-500"
											}`}
											style={{ width: `${(employee.currentHours / employee.maxHours) * 100}%` }}></div>
									</div>
								</div>
							</div>

							<div className="mb-4">
								<label className="block text-gray-700 text-sm font-bold mb-2">Hourly Rate</label>
								{editing ? (
									<input
										type="number"
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
										value={employee.hourlyRate}
										onChange={(e) => setEmployee({ ...employee, hourlyRate: parseInt(e.target.value) })}
									/>
								) : (
									<p className="text-gray-800">${employee.hourlyRate}/hour</p>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="p-6 border-b flex justify-between items-center">
					<h2 className="text-xl font-bold text-gray-800">Availability Blocks</h2>
					<button
						onClick={() => setShowAddAvailability(true)}
						className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
						<Plus className="h-5 w-5 mr-1" />
						Add Block
					</button>
				</div>

				{availabilities.length === 0 ? (
					<div className="p-6 text-center text-gray-500">No availability blocks set</div>
				) : (
					<div className="divide-y">
						{availabilities.map((availability) => (
							<div key={availability.id} className="p-4 hover:bg-gray-50">
								<div className="flex justify-between items-start">
									<div>
										<div className="flex items-center mb-1">
											<Calendar className="h-5 w-5 text-blue-500 mr-2" />
											<span className="font-medium">
												{new Date(availability.date).toLocaleDateString("en-US", {
													weekday: "long",
													year: "numeric",
													month: "long",
													day: "numeric",
												})}
											</span>
										</div>
										<div className="flex items-center text-gray-600 ml-7">
											<Clock className="h-4 w-4 mr-1" />
											<span>
												{availability.startTime} - {availability.endTime}
											</span>
										</div>
										{availability.note && <p className="text-gray-600 mt-2 ml-7">{availability.note}</p>}
									</div>
									<button
										onClick={() => handleDeleteAvailability(availability.id)}
										className="text-red-500 hover:text-red-700">
										<Trash2 className="h-5 w-5" />
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Add Availability Modal */}
			{showAddAvailability && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h2 className="text-xl font-bold mb-4">Add Availability Block</h2>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
							<input
								type="date"
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={newAvailability.date}
								onChange={(e) => setNewAvailability({ ...newAvailability, date: e.target.value })}
							/>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Start Time</label>
							<input
								type="time"
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={newAvailability.startTime}
								onChange={(e) => setNewAvailability({ ...newAvailability, startTime: e.target.value })}
							/>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">End Time</label>
							<input
								type="time"
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={newAvailability.endTime}
								onChange={(e) => setNewAvailability({ ...newAvailability, endTime: e.target.value })}
							/>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Note</label>
							<textarea
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={newAvailability.note}
								onChange={(e) => setNewAvailability({ ...newAvailability, note: e.target.value })}
								placeholder="Optional note about this availability block"
							/>
						</div>

						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setShowAddAvailability(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
								Cancel
							</button>
							<button
								onClick={handleAddAvailability}
								className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
								Add Block
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default EmployeeDetail;
