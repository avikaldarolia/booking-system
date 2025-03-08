import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Reservation } from "./Reservation";
import { BaseEntity } from "../types/base-entity";

@Entity()
export class Customer extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "text" })
	name: string;

	@Column({ type: "text" })
	email: string;

	@Column({ type: "text" })
	phone: string;

	@OneToMany(() => Reservation, (reservation) => reservation.customer)
	reservations: Reservation[];
}
