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
		phone: string;
	};
	date: string;
	startTime: string;
	endTime: string;
	status: string;
	notes: string;
}

export interface Service {
	name: string;
	price: number;
	duration: string;
	description: string;
}

export interface Employee {
	id: string;
	name: string;
	specialties: string;
	imageUrl: string;
	hourlyRate: number;
	rating: number;
}

export interface TimeSlot {
	startTime: string;
	endTime: string;
	available: boolean;
}

export interface Customer {
	email: string;
	phoneNumber: string;
	name?: string;
}
