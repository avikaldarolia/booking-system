import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Relation, RelationId, Unique } from "typeorm";
import { Store } from "./Store";
import { BaseEntity } from "../types/base-entity";
import { Employee } from "./Employee";
import { Week } from "./Week";

@Entity()
@Unique(["employeeId", "weekId"])
@Index(["employeeId", "weekId"])
export class WeeklyEmployeeStats extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("uuid")
	employeeId: string;

	@ManyToOne(() => Employee, (employee) => employee.weeklyEmployeeStats)
	employee: Employee;

	@Column("uuid")
	weekId: string;

	@ManyToOne(() => Week, (week) => week.weeklyEmployeeStats)
	week: Week;

	@RelationId((weeklyEmployeeStats: WeeklyEmployeeStats) => weeklyEmployeeStats.store)
	storeId: string;

	@ManyToOne(() => Store, (store) => store.weeklyBudget)
	store: Store;

	@Column("decimal")
	empHourlyRate: number;

	@Column("decimal", { default: 0 })
	empHours: number;

	@Column("decimal")
	empMaxHours: number;

	@Column("decimal", { default: 0 })
	empTotalCost: number;
}
