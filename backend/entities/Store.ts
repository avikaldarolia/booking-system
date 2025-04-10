import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { BaseEntity } from "../types/base-entity";
import { WeeklyEmployeeStats } from "./WeeklyEmployeeStats";
import { Employee } from "./Employee";
import { Week } from "./Week";
import { Shift } from "./Shift";
import { Reservation } from "./Reservation";

@Entity()
export class Store extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "text" })
	name: string;

	@Column("decimal")
	weeklyBudget: number;

	@Column("time")
	openTime: string;

	@Column("time")
	closeTime: string;

	@OneToMany(() => Employee, (employee) => employee.store)
	employees: Employee[];

	@OneToMany(() => Shift, (shift) => shift.store)
	shifts: Shift[];

	@OneToMany(() => Week, (week) => week.store)
	weeks: Week[];

	@OneToMany(() => Reservation, (reservation) => reservation.store)
	reservations: Week[];

	@OneToMany(() => WeeklyEmployeeStats, (weeklyEmployeeStats) => weeklyEmployeeStats.store)
	weeklyEmployeeStats: WeeklyEmployeeStats[];

	@Column("text", { nullable: true })
	calendarId: string;
}
