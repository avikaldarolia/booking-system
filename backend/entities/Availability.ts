import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BaseEntity, RelationId } from "typeorm";
import { Employee } from "./Employee";

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
