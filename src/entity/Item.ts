import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Item {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    slot: string;

    @Column()
    picture: string;

    @Column()
    description: string;

    @Column("real")
    power: number;
}