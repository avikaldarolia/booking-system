import EmployeeSidebar from "../components/EmployeeSidebar";
import ManagerSidebar from "../components/ManagerSidebar";
import CustomerSidebar from "../components/CustomerSidebar";

export const RoleBasedRenderHash = {
	part_time: { route: "/employee-portal", sidebar: EmployeeSidebar },
	associate: { route: "/employee-portal", sidebar: EmployeeSidebar },
	manager: { route: "/manager-portal", sidebar: ManagerSidebar },
	customer: { route: "/customer-portal", sidebar: CustomerSidebar },
};
