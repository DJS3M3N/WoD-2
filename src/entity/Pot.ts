import { Entity, Column, PrimaryGeneratedColumn, JoinColumn, ManyToOne } from "typeorm";
import { Plant } from "./Plant";

@Entity()
export class Pot {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'timestamp', nullable: true })
    rentedUntil: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    liveUntil: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    nextWatering: Date | null;

    @Column({default: 0})
    stage: number;

    @ManyToOne(() => Plant, {
        createForeignKeyConstraints: false,
        nullable: true })
    @JoinColumn()
    plant: Plant | null; 
}

export type PotDict = { [key: number]: [number, number] };

export const potDict: PotDict = {
    1: [100, -1],
    2: [300, -1],
    3: [-1, 10],
    4: [-1, 10],
    5: [-1, 10],
};
