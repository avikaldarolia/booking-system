import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { RoleBasedRenderHash } from "../utils/utils";

interface User {
	id: string;
	name: string;
	email: string;
	role: "manager" | "associate" | "part_time" | "customer";
}

interface AuthContextType {
	user: User | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => void;
	loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		// Check for existing session
		const token = localStorage.getItem("authToken");
		if (token) {
			axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
			checkAuth();
		} else {
			setLoading(false);
		}
	}, []);

	const checkAuth = async () => {
		try {
			const response = await axios.get("auth/me");
			setUser(response.data);
		} catch (error) {
			localStorage.removeItem("authToken");
			console.log("error", error);
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
			const defaultRoute = RoleBasedRenderHash[user.role]?.route || "/login";
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

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
