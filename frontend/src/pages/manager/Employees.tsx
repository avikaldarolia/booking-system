import axios from "axios";
import { Edit, Eye, EyeOff, Filter, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

const BASE_PAY = 10;
const DEFAULT_EMP_TYPE = "associate";
const DEFAULT_MAX_HOURS = 40;

const Employees = () => {
	const [employees, setEmployees] = useState<Employee[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAddModal, setShowAddModal] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [newEmployee, setNewEmployee] = useState({
		name: "",
		email: "",
		type: DEFAULT_EMP_TYPE,
		maxHours: DEFAULT_MAX_HOURS,
		hourlyRate: BASE_PAY,
	});
	const [searchTerm, setSearchTerm] = useState("");
	const [filterType, setFilterType] = useState("all");
	const storeId = import.meta.env.VITE_STORE_ID;

	useEffect(() => {
		const fetchEmployees = async () => {
			try {
				const response = await axios.get(`employees?storeId=${storeId}`);
				setEmployees(response.data);
				setLoading(false);
			} catch (error) {
				console.log(error);
			}
		};

		fetchEmployees();
	}, [storeId]);

	const togglePassword = () => {
		setShowPassword((prev) => !prev);
	};

	const handleAddEmployee = async () => {
		try {
			const response = await axios.post("employees", {
				...newEmployee,
				storeId,
			});

			setEmployees([...employees, response.data]);
			setShowAddModal(false);
			setNewEmployee({
				name: "",
				email: "",
				type: DEFAULT_EMP_TYPE,
				maxHours: DEFAULT_MAX_HOURS,
				hourlyRate: BASE_PAY,
			});
		} catch (error) {
			console.error("Error adding employee:", error);
			setShowAddModal(false);
		}
	};

	const handleDeleteEmployee = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this employee?")) {
			try {
				await axios.delete(`employees/${id}`);
				setEmployees((employees) => employees.filter((emp) => emp.id !== id));
			} catch (error) {
				console.error("Error deleting employee:", error);
			}
		}
	};

	const filteredEmployees = employees
		.filter(
			(emp) =>
				emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				emp.email.toLowerCase().includes(searchTerm.toLowerCase())
		)
		.filter((emp) => filterType === "all" || emp.type === filterType);

	if (loading) {
		return <Spinner />;
	}
	return (
		<div className="container mx-auto px-4 py-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-gray-800">Employees</h1>
				<button
					onClick={() => setShowAddModal(true)}
					className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
					<Plus className="h-5 w-5 mr-1" />
					Add Employee
				</button>
			</div>
			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="p-4 border-b flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
					<div className="relative w-full md:w-64">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Search className="h-5 w-5 text-gray-400" />
						</div>
						<input
							type="text"
							placeholder="Search employees..."
							className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>

					<div className="flex items-center space-x-2">
						<Filter className="h-5 w-5 text-gray-400" />
						<select
							className="border border-gray-300 rounded-md px-3 py-2"
							value={filterType}
							onChange={(e) => setFilterType(e.target.value)}>
							<option value="all">All Types</option>
							<option value="manager">Manager</option>
							<option value="associate">Associate</option>
							<option value="part_time">Part Time</option>
						</select>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Hours
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
								<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filteredEmployees.map((employee) => (
								<tr key={employee.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="flex items-center">
											<div>
												<div className="text-sm font-medium text-gray-900">{employee.name}</div>
												<div className="text-sm text-gray-500">{employee.email}</div>
											</div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span
											className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
												employee.type === "manager"
													? "bg-purple-100 text-purple-800"
													: employee.type === "associate"
													? "bg-blue-100 text-blue-800"
													: "bg-green-100 text-green-800"
											}`}>
											{employee.type.charAt(0).toUpperCase() + employee.type.slice(1).replace("_", " ")}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">
											{employee.currentHours} / {employee.maxHours}
										</div>
										<div className="w-24 bg-gray-200 rounded-full h-2.5 mt-1">
											<div
												className={`h-2.5 rounded-full ${
													employee.currentHours / employee.maxHours > 0.8 ? "bg-red-500" : "bg-blue-500"
												}`}
												style={{
													width: `${(employee.currentHours / employee.maxHours) * 100}%`,
												}}></div>
										</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${employee.hourlyRate}/hr</td>
									<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
										<div className="flex justify-end space-x-2">
											<Link to={`/employees/${employee.id}`} className="text-blue-500 hover:text-blue-700">
												<Edit className="h-5 w-5" />
											</Link>
											<button
												onClick={() => handleDeleteEmployee(employee.id)}
												className="text-red-500 hover:text-red-700">
												<Trash2 className="h-5 w-5" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Add Employee Modal */}
			{showAddModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h2 className="text-xl font-bold mb-4">Add New Employee</h2>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
							<input
								type="text"
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={newEmployee.name}
								onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
							/>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
							<input
								type="email"
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={newEmployee.email}
								onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
							/>
						</div>
						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Password: 'name'-'email'</label>
							<div className="flex items-center border border-gray-300 rounded-md px-3 py-2">
								<input
									type={showPassword ? "text" : "password"}
									className="w-full outline-none text-gray-700"
									value={`${newEmployee.name}-${newEmployee.email}`}
									readOnly
								/>
								<button
									type="button"
									onClick={togglePassword}
									className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none">
									{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
								</button>
							</div>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Type</label>
							<select
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={newEmployee.type}
								onChange={(e) => setNewEmployee({ ...newEmployee, type: e.target.value })}>
								<option value="manager">Manager</option>
								<option value="associate">Associate</option>
								<option value="part_time">Part Time</option>
							</select>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Max Hours</label>
							<input
								type="number"
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={newEmployee.maxHours}
								onChange={(e) =>
									setNewEmployee({
										...newEmployee,
										maxHours: parseInt(e.target.value),
									})
								}
							/>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Hourly Rate ($)</label>
							<input
								type="number"
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={newEmployee.hourlyRate}
								onChange={(e) =>
									setNewEmployee({
										...newEmployee,
										hourlyRate: parseInt(e.target.value),
									})
								}
							/>
						</div>

						<div className="flex justify-end space-x-2">
							<button
								onClick={() => setShowAddModal(false)}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
								Cancel
							</button>
							<button
								onClick={handleAddEmployee}
								className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
								Add Employee
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Employees;
