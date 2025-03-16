import { ReactNode } from "react";
import { useAuth } from "../contexts/AuthContext";
import { RoleBasedRenderHash } from "../utils/utils";
import Header from "../components/Header";

interface LayoutProps {
	children: ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
	const { user } = useAuth();
	const sidebar =
		user?.role && RoleBasedRenderHash[user.role].sidebar() ? RoleBasedRenderHash[user.role].sidebar() : null;

	return (
		<div className="flex h-screen bg-gray-100">
			{user && sidebar}
			<div className="flex-1 flex flex-col overflow-hidden">
				{user && <Header />}
				<main className="flex-1 overflow-y-auto p-4">{children}</main>
			</div>
		</div>
	);
}
