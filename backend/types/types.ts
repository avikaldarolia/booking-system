export interface User {
	id: string;
	email: string;
	role: string;
}

export interface IServiceResponse<T> {
	success: boolean;
	data: T;
	err: string;
}
