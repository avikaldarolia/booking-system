import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { BaseEntity } from "../types/base-entity";
import { WeeklyStats } from "./WeeklyStats";
import { Employee } from "./Employee";

@Entity()
export class Store extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column()
	name: string;

	@Column("decimal")
	weeklyBudget: number;

	@Column("time")
	openTime: string;

	@Column("time")
	closeTime: string;

	@OneToMany(() => Employee, (employee) => employee.store)
	employees: Employee[];

	@OneToMany(() => WeeklyStats, (weeklyStats) => weeklyStats.store)
	weeklyStats: WeeklyStats[];
}
