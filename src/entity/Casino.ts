import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Casino {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;
    
    @Column({type: 'varchar', array: true})
    outcomes: string[];

    @Column({type: 'real', array: true})
    chances: number[];

    @Column({type: 'int', array: true})
    prizes: number[];

    @Column({type: 'varchar', array: true})
    pictures: string[];

    @Column("int")
    price: number;
}