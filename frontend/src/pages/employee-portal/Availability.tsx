import { useState, useEffect } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";
import { useAuth } from "../../contexts/AuthContext";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import Spinner from "../../components/Spinner";

interface Availability {
	id: string;
	date: string;
	startTime: string;
	endTime: string;
	isBlocked: boolean;
	note: string;
}

const EmployeeAvailability = () => {
	const { user } = useAuth();
	const [availabilities, setAvailabilities] = useState<Availability[]>([]);
	const [loading, setLoading] = useState(true);
	const [showAddModal, setShowAddModal] = useState(false);
	const [newAvailability, setNewAvailability] = useState({
		date: format(new Date(), "yyyy-MM-dd"),
		startTime: "09:00",
		endTime: "17:00",
		isBlocked: true,
		note: "",
	});
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchAvailability = async () => {
			try {
				const response = await axios.get(`availability/employee/${user?.id}`);
				setAvailabilities(response.data);
				setLoading(false);
			} catch (error) {
				console.error("Error fetching availability:", error);
				setLoading(false);
			}
		};

		if (user?.id) {
			fetchAvailability();
		}
	}, [user]);

	const handleAddAvailability = async () => {
		try {
			const response = await axios.post("availability", {
				...newAvailability,
				employeeId: user?.id,
			});

			setAvailabilities([...availabilities, response.data]);
			setShowAddModal(false);
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

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h2 className="text-2xl font-bold text-gray-800">My Availability (Blocked)</h2>
				<button
					onClick={() => setShowAddModal(true)}
					className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
					<Plus className="h-5 w-5 mr-1" />
					Add Blocker
				</button>
			</div>

			<div className="grid gap-6">
				{availabilities.map((availability) => (
					<div key={availability.id} className="bg-white rounded-lg shadow-lg p-6">
						<div className="flex justify-between items-start">
							<div>
								<div className="flex items-center mb-2">
									<Calendar className="h-5 w-5 text-blue-500 mr-2" />
									<span className="font-semibold">{format(parseISO(availability.date), "MMMM d, yyyy")}</span>
								</div>
								<div className="flex items-center text-gray-600">
									<Clock className="h-4 w-4 mr-2" />
									{availability.startTime} - {availability.endTime}
								</div>
								{availability.note && <p className="mt-2 text-gray-600 text-sm">{availability.note}</p>}
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

			{/* Add Availability Modal */}
			{showAddModal && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-md">
						<h3 className="text-xl font-bold mb-4">Add Availability</h3>

						{error && (
							<div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
						)}

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Date</label>
							<input
								type="date"
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={newAvailability.date}
								onChange={(e) =>
									setNewAvailability({
										...newAvailability,
										date: e.target.value,
									})
								}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4 mb-4">
							<div>
								<label className="block text-gray-700 text-sm font-bold mb-2">Start Time</label>
								<input
									type="time"
									className="w-full px-3 py-2 border border-gray-300 rounded-md"
									value={newAvailability.startTime}
									onChange={(e) =>
										setNewAvailability({
											...newAvailability,
											startTime: e.target.value,
										})
									}
								/>
							</div>

							<div>
								<label className="block text-gray-700 text-sm font-bold mb-2">End Time</label>
								<input
									type="time"
									className="w-full px-3 py-2 border border-gray-300 rounded-md"
									value={newAvailability.endTime}
									onChange={(e) =>
										setNewAvailability({
											...newAvailability,
											endTime: e.target.value,
										})
									}
								/>
							</div>
						</div>

						<div className="mb-4">
							<label className="block text-gray-700 text-sm font-bold mb-2">Note (Optional)</label>
							<textarea
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={newAvailability.note}
								onChange={(e) =>
									setNewAvailability({
										...newAvailability,
										note: e.target.value,
									})
								}
								placeholder="Add any notes about this availability"
							/>
						</div>

						<div className="flex justify-end space-x-2">
							<button
								onClick={() => {
									setShowAddModal(false);
									setError(null);
								}}
								className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
								Cancel
							</button>
							<button
								onClick={handleAddAvailability}
								className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
								Add
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default EmployeeAvailability;
