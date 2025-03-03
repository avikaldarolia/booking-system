import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	BaseEntity,
} from "typeorm";
import { Employee } from "./Employee";
import { Store } from "./Store";

@Entity()
export class Shift extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(() => Employee, (employee) => employee.shifts)
	employee: Employee;

	@ManyToOne(() => Store)
	store: Store;

	@Column("date")
	date: Date;

	@Column("time")
	startTime: string;

	@Column("time")
	endTime: string;

	@Column("decimal")
	hours: number;

	@Column("decimal")
	cost: number;

	@Column("text", { nullable: true })
	note: string;

	@Column("boolean", { default: false })
	isPublished: boolean;

	@Column("text", { nullable: true })
	googleCalendarEventId: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
