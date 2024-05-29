import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Market {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    owner_id: number;

    @Column()
    price: number;

    @Column()
    item_id: number;
}