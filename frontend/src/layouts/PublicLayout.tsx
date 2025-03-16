import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { RoleBasedRenderHash } from "../utils/utils";
import CustomerHeader from "../components/CustomerHeader";

interface LayoutProps {
	children?: ReactNode;
}

export default function PublicLayout({ children }: LayoutProps) {
	const { user } = useAuth();

	if (user && user.role !== "customer") {
		return <Navigate to={RoleBasedRenderHash[user.role].route} replace />;
	}

	return (
		<div className="min-h-screen flex flex-col bg-gray-200">
			<CustomerHeader />
			<main className="flex-1 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
				{children || <Outlet />}
			</main>
		</div>
	);
}
