import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, RelationId, Index } from "typeorm";
import { Employee } from "./Employee";
import { Store } from "./Store";
import { BaseEntity } from "../types/base-entity";
import { Week } from "./Week";

@Entity()
@Index(["weekId"])
@Index(["employeeId"])
export class Shift extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("uuid")
	employeeId: string;

	@ManyToOne(() => Employee, (employee) => employee.shifts, { onDelete: "CASCADE", cascade: ["soft-remove"] })
	employee: Employee;

	@RelationId((shift: Shift) => shift.store)
	storeId: string;

	@ManyToOne(() => Store)
	store: Store;

	@Column({ type: "date" })
	date: Date;

	@Column("time")
	startTime: string;

	@Column("time")
	endTime: string;

	@Column("decimal")
	hours: number;

	@Column("uuid")
	weekId: string;

	@ManyToOne(() => Week)
	week: Week;

	@Column("decimal")
	cost: number;

	@Column("text", { nullable: true })
	note: string;

	@Column("text", { nullable: true })
	googleCalendarEventId: string;
}
