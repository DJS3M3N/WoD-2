import { Entity, Column, PrimaryColumn, OneToOne, JoinColumn, ManyToOne } from "typeorm"
import { Pot } from "./Pot";
import { Clan } from "./Clan";

@Entity()
export class User {

    @PrimaryColumn()
    id: number;

    @Column()
    char_name: string;

    @Column()
    avatar: string;

    @Column()
    is_admin: boolean;

    @Column()
    char_class: string;

    @Column("int")
    money: number;

    @Column("int")
    rm_currency: number;

    @Column({type: "int", default: 1})
    level: number;

    @Column({default: 0})
    arms_item_equiped: number;

    @Column({default: 0})
    legs_item_equiped: number;

    @Column({default: 0})
    feet_item_equiped: number;

    @Column({default: 0})
    lefthand_item_equiped: number;

    @Column({default: 0})
    righthand_item_equiped: number;

    @Column({default: 0})
    head_item_equiped: number;

    @Column({default: 0})
    thorax_item_equiped: number;

    // gardening
    @OneToOne(() => Pot, { nullable: true })
    @JoinColumn()
    pot_1: Pot | null;
    
    @OneToOne(() => Pot, { nullable: true })
    @JoinColumn()
    pot_2: Pot | null;
    
    @OneToOne(() => Pot, { nullable: true })
    @JoinColumn()
    pot_3: Pot | null;
    
    @OneToOne(() => Pot, { nullable: true })
    @JoinColumn()
    pot_4: Pot | null;
    
    @OneToOne(() => Pot, { nullable: true })
    @JoinColumn()
    pot_5: Pot | null;

    // clan 
    @ManyToOne(() => Clan, clan => clan.members)
    clan: Clan | null;

    // walk 

    @Column({ type: 'timestamp', nullable: true })
    last_walk: Date | null;
}
