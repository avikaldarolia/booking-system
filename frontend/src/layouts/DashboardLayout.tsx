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
		<div className="flex h-screen w-full overflow-y-hidden">
			{user && sidebar}
			<main className="flex flex-col w-full bg-gray-200">
				{user && <Header />}
				<div className="overflow-y-hidden">{children}</div>
			</main>
		</div>
	);
}
