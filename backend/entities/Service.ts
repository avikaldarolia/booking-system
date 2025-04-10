import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { BaseEntity } from "../types/base-entity";
import { Store } from "./Store";
import { Shift } from "./Shift";

@Entity()
export class Service extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar" })
	name: string;

	@Column("int")
	cost: number;

	@Column("int")
	duration: number;

	@Column("text", { nullable: true })
	description: string;

	@RelationId((shift: Shift) => shift.store)
	storeId: string;

	@ManyToOne(() => Store)
	store: Store;
}
