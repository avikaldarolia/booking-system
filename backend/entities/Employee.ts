import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, RelationId } from "typeorm";
import { Store } from "./Store";
import { Availability } from "./Availability";
import { Shift } from "./Shift";
import { BaseEntity } from "../types/base-entity";

export enum EmployeeType {
	MANAGER = "manager",
	ASSOCIATE = "associate",
	PART_TIME = "part_time",
}

@Entity()
export class Employee extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar" })
	name: string;

	@Column({ type: "text" })
	email: string;

	@Column({
		type: "enum",
		enum: EmployeeType,
		default: EmployeeType.ASSOCIATE,
	})
	type: EmployeeType;

	@Column("decimal")
	maxHours: number;

	@Column("decimal", { default: 0 })
	currentHours: number;

	@Column("decimal")
	hourlyRate: number;

	@RelationId((employee: Employee) => employee.store)
	storeId: string;

	@ManyToOne(() => Store, (store) => store.employees)
	store: Store;

	@OneToMany(() => Availability, (availability) => availability.employee)
	availabilities: Availability[];

	@OneToMany(() => Shift, (shift) => shift.employee)
	shifts: Shift[];
}
