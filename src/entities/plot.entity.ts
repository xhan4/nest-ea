import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { Plant } from './plant.entity';
import { Sect } from './sect.entity';

@Entity('tb_plot')
export class Plot {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Sect, (sect) => sect.plots)
  @JoinColumn({ name: 'sect_id' })
  sect: Sect;

  @Column({ type: 'int', comment: 'x' })
  positionX: number;

  @Column({ type: 'int', comment: 'y' })
  positionY: number;

  @Column({ type: 'enum', enum: ['locked', 'unlocked', 'upgrading'], default: 'unlocked' })
  status: string;

  @Column({ type: 'int', default: 1 })
  level: number;

  @Column({ type: 'int', default: 0})
  fertility: number;

  @OneToOne(() => Plant, { nullable: true, cascade: ['remove'] })
  @JoinColumn({ name: 'plant_id' })
  plant?: Plant; 
}