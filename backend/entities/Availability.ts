import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, RelationId } from "typeorm";
import { Employee } from "./Employee";
import { BaseEntity } from "../types/base-entity";

@Entity()
export class Availability extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@RelationId((availability: Availability) => availability.employee)
	employeeId: string;

	@ManyToOne(() => Employee, (employee) => employee.availabilities)
	employee: Employee;

	@Column("date")
	date: Date;

	@Column("time")
	startTime: string;

	@Column("time")
	endTime: string;

	@Column("boolean", { default: false })
	isBlocked: boolean;

	@Column("text", { nullable: true })
	note: string;
}
