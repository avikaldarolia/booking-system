import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { BaseEntity } from "../types/base-entity";
import { Store } from "./Store";
import { WeeklyStats } from "./WeeklyStats";

@Entity()
export class Week extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@RelationId((week: Week) => week.store)
	storeId: string;

	@ManyToOne(() => Store, (store) => store.weeklyBudget)
	store: Store;

	@OneToMany(() => WeeklyStats, (weeklyStats) => weeklyStats.employee, {
		onDelete: "CASCADE",
		cascade: ["soft-remove"],
	})
	weeklystats: WeeklyStats[];

	@Column("date")
	startDate: Date;

	@Column("date")
	endDate: Date;

	@Column("decimal")
	budget: number;

	@Column("decimal", { default: 0 })
	cost: number;
}
