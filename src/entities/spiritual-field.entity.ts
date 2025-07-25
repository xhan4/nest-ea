import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Sect } from "./sect.entity";

@Entity("tb_spiritual_field")
export class SpiritualField {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sect, sect => sect.spiritualFields)
  sect: Sect;

  @Column({ length: 50 })
  name: string;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  fertility: number;

  @Column({ default: 0 })
  output: number; 

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  last_harvest_time: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  next_harvest_time: Date;

  @Column({ default: false })
  is_planted: boolean;

  @Column({ length: 50, nullable: true })
  planted_item: string; 
}
