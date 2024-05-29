import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Plant {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    emoji_icon: string;

    @Column()
    description: string;

    @Column("int")
    cost_money: number;

    @Column("int")
    cost_rmcurrency: number;

    @Column("int")
    watering_interval: number;

    @Column("int")
    sale_price: number;

    @Column("int")
    death_time: number;
}
