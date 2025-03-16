import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";
import Spinner from "../../components/Spinner";

const MyProfile = () => {
	const { user } = useAuth();
	const [editing, setEditing] = useState(false);
	const [profile, setProfile] = useState({
		name: user?.name || "",
		email: user?.email || "",
		phone: user?.phone || "",
	});
	const [loading, setLoading] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setProfile({ ...profile, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		try {
			await axios.put(`/users/${user?.id}`, profile);
			alert("Profile updated successfully!");
			setEditing(false);
		} catch (error) {
			console.error("Error updating profile:", error);
			alert("Failed to update profile. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <Spinner />;
	}

	return (
		<div className="container mx-auto px-4 py-6 max-w-md">
			<div className="bg-white rounded-lg shadow p-6 text-center">
				{/* <img
					src={profile.imageUrl || "/default-avatar.png"}
					alt="Profile"
					className="h-24 w-24 rounded-full mx-auto mb-4 object-cover"
				/> */}
				{editing ? (
					<form onSubmit={handleSubmit} className="space-y-4">
						<input
							type="text"
							name="name"
							value={profile.name}
							onChange={handleChange}
							className="w-full p-2 border rounded"
							placeholder="Name"
						/>
						<input
							type="email"
							name="email"
							value={profile.email}
							onChange={handleChange}
							className="w-full p-2 border rounded"
							placeholder="Email"
						/>
						<input
							type="text"
							name="phone"
							value={profile.phone}
							onChange={handleChange}
							className="w-full p-2 border rounded"
							placeholder="Phone"
						/>
						{/* <input
							type="text"
							name="imageUrl"
							value={profile.imageUrl}
							onChange={handleChange}
							className="w-full p-2 border rounded"
							placeholder="Profile Image URL"
						/> */}
						<button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full" disabled={loading}>
							{loading ? "Saving..." : "Save Changes"}
						</button>
						<button
							type="button"
							className="bg-gray-300 text-gray-700 px-4 py-2 rounded w-full"
							onClick={() => setEditing(false)}>
							Cancel
						</button>
					</form>
				) : (
					<div>
						<h1 className="text-xl font-semibold">{profile.name}</h1>
						<p className="text-gray-600">{profile.email}</p>
						<p className="text-gray-600">{profile.phone}</p>
						<button onClick={() => setEditing(true)} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
							Edit Profile
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default MyProfile;
