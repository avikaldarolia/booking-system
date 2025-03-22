import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { BaseEntity } from "../types/base-entity";
import { WeeklyStats } from "./WeeklyStats";
import { Employee } from "./Employee";
import { Week } from "./Week";
import { Shift } from "./Shift";

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

	@OneToMany(() => WeeklyStats, (weeklyStats) => weeklyStats.store)
	weeklyStats: WeeklyStats[];

	@Column("text", { nullable: true })
	calendarId: string;
}
