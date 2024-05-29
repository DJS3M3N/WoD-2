import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Avatars {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    link: string;

    @Column()
    link_with_num: string;
}