import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Inventory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    owner: number;

    @Column()
    item_id: number;
}