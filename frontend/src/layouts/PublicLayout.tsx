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
		<div className="min-h-screen  w-full flex flex-col bg-black">
			<CustomerHeader />
			<main className="flex-1 flex items-center justify-center">{children || <Outlet />}</main>
		</div>
	);
}
