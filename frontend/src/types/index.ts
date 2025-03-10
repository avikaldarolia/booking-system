export interface User {
	id: string;
	name: string;
	email: string;
	role: "manager" | "associate" | "part_time" | "customer";
}

export interface Shift {
	id: string;
	date: string;
	startTime: string;
	endTime: string;
	note: string;
}

export interface Availability {
	id: string;
	date: string;
	startTime: string;
	endTime: string;
	isBlocked: boolean;
	note: string;
}

export interface Reservation {
	id: string;
	customer: {
		name: string;
		email: string;
	};
	date: string;
	startTime: string;
	endTime: string;
	status: string;
	notes: string;
}
