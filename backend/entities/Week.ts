import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { BaseEntity } from "../types/base-entity";
import { Store } from "./Store";
import { WeeklyStats } from "./WeeklyStats";
import { Shift } from "./Shift";

@Entity()
@Index(["startDate", "endDate"])
export class Week extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@RelationId((week: Week) => week.store)
	storeId: string;

	@ManyToOne(() => Store, (store) => store.weeklyBudget)
	store: Store;

	@OneToMany(() => WeeklyStats, (weeklyStats) => weeklyStats.week, {
		onDelete: "CASCADE",
		cascade: ["soft-remove"],
	})
	weeklystats: WeeklyStats[];

	@OneToMany(() => Shift, (shifts) => shifts.week, {
		onDelete: "CASCADE",
		cascade: ["soft-remove"],
	})
	shifts: Shift[];

	@Column("date")
	startDate: Date;

	@Column("date")
	endDate: Date;

	@Column("decimal")
	budget: number;

	@Column("decimal", { default: 0 })
	cost: number;

	@Column("decimal", { default: 0 })
	hours: number;
}
