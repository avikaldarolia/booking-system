import EmployeeSidebar from "../components/EmployeeSidebar";
import ManagerSidebar from "../components/ManagerSidebar";
import CustomerSidebar from "../components/CustomerSidebar";
import { addMinutes, parseISO } from "date-fns";

export const RoleBasedRenderHash = {
	part_time: { route: "/employee-portal", sidebar: EmployeeSidebar },
	associate: { route: "/employee-portal", sidebar: EmployeeSidebar },
	manager: { route: "/manager-portal", sidebar: ManagerSidebar },
	customer: { route: "/customer-portal", sidebar: CustomerSidebar },
};

export const formatPhoneNumber = (value: string) => {
	// Remove all non-digit characters
	const digits = value.replace(/\D/g, "");
	// Apply formatting based on length
	if (digits.length <= 3) return digits;
	if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
	return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

export const getDateTimeForEvent = (date: string, time: string) => {
	const [hours, minutes] = time.split(":").map(Number);
	const dateTime = new Date(date);
	dateTime.setHours(hours, minutes, 0);

	return dateTime;
};

/**
 *
 * @param date
 * @returns
 */
export const localeDate = (date: string) => {
	const isoDate = parseISO(date);
	const fDate = addMinutes(isoDate, isoDate.getTimezoneOffset());
	return fDate;
};

export const debounce = <T extends (...args: unknown[]) => void>(
	callback: T,
	time: number
): ((...args: Parameters<T>) => void) => {
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	return (...args: Parameters<T>) => {
		if (timeoutId !== null) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			callback(...args);
			timeoutId = null;
		}, time);
	};
};
