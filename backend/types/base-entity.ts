import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

export abstract class BaseEntity {
	@CreateDateColumn({ type: "timestamp with time zone" })
	readonly createdAt: Date;

	@UpdateDateColumn({ type: "timestamp with time zone" })
	readonly updatedAt: Date;

	@DeleteDateColumn({ type: "timestamp with time zone", nullable: true })
	readonly deletedAt: Date | null;
}
