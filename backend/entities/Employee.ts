import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, RelationId, BeforeInsert } from "typeorm";
import { Store } from "./Store";
import { Availability } from "./Availability";
import { Shift } from "./Shift";
import { BaseEntity } from "../types/base-entity";
import { Reservation } from "./Reservation";
import bcrypt from "bcryptjs";
import { WeeklyStats } from "./WeeklyStats";

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

	@Column({ type: "text", select: false })
	password: string;

	@Column({
		type: "enum",
		enum: EmployeeType,
		default: EmployeeType.ASSOCIATE,
	})
	type: EmployeeType;

	@Column("decimal")
	maxHours: number;

	@Column("decimal")
	hourlyRate: number;

	@Column("text", { nullable: true })
	specialties: string;

	@Column("text", { nullable: true })
	bio: string;

	@Column("text", { nullable: true })
	imageUrl: string;

	@RelationId((employee: Employee) => employee.store)
	storeId: string;

	@ManyToOne(() => Store, (store) => store.employees)
	store: Store;

	@OneToMany(() => Availability, (availability) => availability.employee, {
		onDelete: "CASCADE",
		cascade: ["soft-remove"],
	})
	availabilities: Availability[];

	@OneToMany(() => Shift, (shift) => shift.employee, { onDelete: "CASCADE", cascade: ["soft-remove"] })
	shifts: Shift[];

	@OneToMany(() => Reservation, (reservation) => reservation.employee, {
		onDelete: "CASCADE",
		cascade: ["soft-remove"],
	})
	reservations: Reservation[];

	@OneToMany(() => WeeklyStats, (weeklyStats) => weeklyStats.employee, {
		onDelete: "CASCADE",
		cascade: ["soft-remove"],
	})
	weeklystats: WeeklyStats[];

	@BeforeInsert()
	async hashPassword() {
		if (this.password) {
			this.password = await bcrypt.hash(this.password, 10);
		}
	}
}
