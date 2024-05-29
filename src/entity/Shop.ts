import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Shop {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    item_id: number;

    @Column()
    isActvie: boolean;

    @Column('int')
    price: number;

    @Column('int')
    rm_price: number;

    @Column()
    currency_type: string;
}