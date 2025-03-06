import { useEffect, useState } from "react";
import Spinner from "../components/Spinner";
import { Save, Store, Calendar, RefreshCw } from "lucide-react";
import axios from "axios";

interface StoreSettings {
	id: string;
	name: string;
	weeklyBudget: number;
	openTime: string;
	closeTime: string;
}

const Settings = () => {
	const [storeSettings, setStoreSettings] = useState<StoreSettings>({
		id: import.meta.env.VITE_STORE_ID,
		name: "",
		weeklyBudget: 0,
		openTime: "09:00",
		closeTime: "17:00",
	});

	const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const storeId = import.meta.env.VITE_STORE_ID;

	useEffect(() => {
		const fetchSettings = async () => {
			try {
				const settingsResponse = await axios.get(`stores/${storeId}`);
				setStoreSettings(settingsResponse.data);

				// Check if Google Calendar is connected
				const calendarResponse = await axios.get(`google-calendar/heartbeat`);
				console.log("calender Response", calendarResponse);

				setGoogleCalendarConnected(calendarResponse.data.googleCalendarConnected);

				setLoading(false);
			} catch (error) {
				console.error("Error fetching settings:", error);
				setLoading(false);
			}
		};

		fetchSettings();
	}, [storeId]);

	const handleSaveSettings = async () => {
		setSaving(true);

		try {
			await axios.put(`stores/${storeSettings.id}`, storeSettings);
			setSaveSuccess(true);
			// setTimeout(() => setSaveSuccess(false), 3000);
		} catch (error) {
			console.error("Error saving settings:", error);
		}

		setSaving(false);
	};

	const handleResetEmployeeHours = async () => {
		if (window.confirm("Are you sure you want to reset all employee hours to zero? This action cannot be undone.")) {
			try {
				await axios.post(`employees/reset-hours/${storeSettings.id}`);
				alert("Employee hours have been reset successfully.");
			} catch (error) {
				console.error("Error resetting employee hours:", error);
			}
		}
	};

	const handleConnectGoogleCalendar = () => {
		// In a real app, this would redirect to Google OAuth
		alert("In a real application, this would redirect to Google OAuth for authentication.");
		setGoogleCalendarConnected(true);
	};
	if (loading) {
		return <Spinner />;
	}
	return (
		<div className="container mx-auto px-4 py-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-2xl font-bold text-gray-800">Settings</h1>
				<button
					onClick={handleSaveSettings}
					disabled={saving}
					className={`${
						saving ? "bg-gray-400" : saveSuccess ? "bg-green-500" : "bg-blue-500 hover:bg-blue-600"
					} text-white px-4 py-2 rounded-lg flex items-center`}>
					<Save className="h-5 w-5 mr-1" />
					{saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Settings"}
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="bg-white rounded-lg shadow p-6">
					<h2 className="text-xl font-semibold mb-4 flex items-center">
						<Store className="h-5 w-5 text-blue-500 mr-2" />
						Store Information
					</h2>

					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2">Store Name</label>
						<input
							type="text"
							className="w-full px-3 py-2 border border-gray-300 rounded-md"
							value={storeSettings.name}
							onChange={(e) => setStoreSettings({ ...storeSettings, name: e.target.value })}
						/>
					</div>

					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2">Weekly Budget ($)</label>
						<input
							type="number"
							className="w-full px-3 py-2 border border-gray-300 rounded-md"
							value={storeSettings.weeklyBudget}
							onChange={(e) => setStoreSettings({ ...storeSettings, weeklyBudget: parseInt(e.target.value) })}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-gray-700 text-sm font-bold mb-2">Opening Time</label>
							<input
								type="time"
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={storeSettings.openTime}
								onChange={(e) => setStoreSettings({ ...storeSettings, openTime: e.target.value })}
							/>
						</div>

						<div>
							<label className="block text-gray-700 text-sm font-bold mb-2">Closing Time</label>
							<input
								type="time"
								className="w-full px-3 py-2 border border-gray-300 rounded-md"
								value={storeSettings.closeTime}
								onChange={(e) => setStoreSettings({ ...storeSettings, closeTime: e.target.value })}
							/>
						</div>
					</div>
				</div>

				<div className="space-y-6">
					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-xl font-semibold mb-4 flex items-center">
							<Calendar className="h-5 w-5 text-blue-500 mr-2" />
							Calendar Integration
						</h2>

						<p className="text-gray-600 mb-4">
							Connect with Google Calendar to automatically sync your employee shifts.
						</p>

						{googleCalendarConnected ? (
							<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
								<p className="font-bold">Connected to Google Calendar</p>
								<p className="text-sm">Your shifts are being synced automatically.</p>
							</div>
						) : (
							<button
								onClick={handleConnectGoogleCalendar}
								className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
								Connect Google Calendar
							</button>
						)}
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<h2 className="text-xl font-semibold mb-4 flex items-center">
							<RefreshCw className="h-5 w-5 text-blue-500 mr-2" />
							Reset Options
						</h2>

						<p className="text-gray-600 mb-4">Reset employee hours at the beginning of a new pay period.</p>

						<button
							onClick={handleResetEmployeeHours}
							className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
							Reset All Employee Hours
						</button>

						<p className="text-sm text-gray-500 mt-2">
							This will set all employee current hours to zero. This action cannot be undone.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Settings;
