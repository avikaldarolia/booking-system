import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, RelationId } from "typeorm";
import { Employee } from "./Employee";
import { Customer } from "./Customer";
import { BaseEntity } from "../types/base-entity";
import { Store } from "./Store";

export enum ReservationStatus {
	PENDING = "pending",
	CONFIRMED = "confirmed",
	COMPLETED = "completed",
	CANCELLED = "cancelled",
}

export enum ReservationDuration {
	THIRTY_MIN = 30,
	FORTY_FIVE_MIN = 45,
	ONE_HOUR = 60,
}

@Entity()
export class Reservation extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@RelationId((reservation: Reservation) => reservation.employee)
	employeeId: string;

	@ManyToOne(() => Employee, (employee) => employee.reservations, { onDelete: "CASCADE" })
	employee: Employee;

	@RelationId((reservation: Reservation) => reservation.store)
	storeId: string;

	@ManyToOne(() => Store, (store) => store.reservations, { onDelete: "CASCADE" })
	store: Store;

	@RelationId((reservation: Reservation) => reservation.customer)
	customerId: string;

	@ManyToOne(() => Customer, (customer) => customer.reservations, { onDelete: "CASCADE" })
	customer: Customer;

	@Column("date")
	date: Date;

	@Column("time")
	startTime: string;

	@Column("time")
	endTime: string;

	@Column("int")
	duration: number;

	@Column("int", { nullable: true })
	cost: number;

	@Column({
		type: "enum",
		enum: ReservationStatus,
		default: ReservationStatus.PENDING,
	})
	status: ReservationStatus;

	@Column("text", { nullable: true })
	notes: string;
}
