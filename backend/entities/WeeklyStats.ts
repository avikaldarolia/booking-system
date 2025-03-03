import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Store } from "./Store";
import { BaseEntity } from "../types/base-entity";

@Entity()
export class WeeklyStats extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@ManyToOne(() => Store, (store) => store.weeklyBudget)
	store: Store;

	@Column("date")
	weekStartDate: Date;
	@Column("date")
	weekEndDate: Date;

	@Column("decimal", { default: 0 })
	totalHours: number;

	@Column("decimal", { default: 0 })
	totalCost: number;

	@Column("decimal")
	budgetAllocated: number;

	@Column("decimal", { default: 0 })
	budgetRemaining: number;

	@Column("text", { nullable: true })
	notes: string;
}
