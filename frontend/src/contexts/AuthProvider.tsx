import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { RoleBasedRenderHash } from "../utils/utils";
import { AuthContext } from "./AuthContext"; // Import from the new file

interface User {
	id: string;
	name: string;
	email: string;
	role: "manager" | "associate" | "part_time" | "customer";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("authToken");
		let isMounted = true;

		if (token) {
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
			checkAuth().then(() => {
				if (!isMounted) return; // Prevent state update after unmount
			});
		} else {
			setLoading(false);
		}

		return () => {
			isMounted = false;
		};
	}, []);

	const checkAuth = async () => {
		try {
			const response = await axios.get("auth/me");
			setUser(response.data as User);
		} catch (error) {
			localStorage.removeItem("authToken");
			console.log("error", error);
			setUser(null);
			delete axios.defaults.headers.common["Authorization"];
		} finally {
			setLoading(false);
		}
	};

	const login = async (email: string, password: string) => {
		try {
			const response = await axios.post("auth/login", { email, password });
			const { token, user }: { token: string; user: User } = response.data;

			localStorage.setItem("authToken", token);
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
			setUser(user);
			const defaultRoute = RoleBasedRenderHash[user.role]?.route || "/employee-login";
			navigate(defaultRoute);
		} catch (error) {
			console.log("error", error);
			throw new Error("Invalid credentials");
		}
	};

	const logout = () => {
		localStorage.removeItem("authToken");
		delete axios.defaults.headers.common["Authorization"];
		setUser(null);
	};

	return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>;
}
