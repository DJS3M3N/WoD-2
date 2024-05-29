import { Column, Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne} from "typeorm";
import { User } from "./User";

@Entity()
export class Clan {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ unique: true })
    uniqueInvitationCode: string;

    @Column({type: "int", default: 0})
    level: number;

    @OneToMany(() => User, user => user.clan)
    members: User[];

    @ManyToOne(() => User, user => user.id, { nullable: false })
    administrator: User;
}
