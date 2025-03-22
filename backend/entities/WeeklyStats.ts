import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Relation, RelationId, Unique } from "typeorm";
import { Store } from "./Store";
import { BaseEntity } from "../types/base-entity";
import { Employee } from "./Employee";
import { Week } from "./Week";

@Entity()
@Unique(["employeeId", "weekId"])
@Index(["employeeId", "weekId"])
export class WeeklyStats extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column("uuid")
	employeeId: string;

	@ManyToOne(() => Employee, (employee) => employee.weeklystats)
	employee: Employee;

	@Column("uuid")
	weekId: string;

	@ManyToOne(() => Week, (week) => week.weeklystats)
	// week: Relation<Week>;
	week: Week;

	@RelationId((weeklyStats: WeeklyStats) => weeklyStats.store)
	storeId: string;

	@ManyToOne(() => Store, (store) => store.weeklyBudget)
	// store: Relation<Store>;
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
