import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { Plot } from './plot.entity';
import { Item } from './item.entity';
import { GrowthStatus } from 'src/core/enums/grow.enum';

@Entity('tb_plant')
export class Plant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: GrowthStatus, default: GrowthStatus.SEED})
  growthStatus: GrowthStatus;

  @Column({ type: 'int', default: 0 })
  growthProgress: number;

  @Column({ type: 'timestamp' })
  plantedAt: Date;

  @Column({ type: 'timestamp' })
  expectedHarvestTime: Date;

  @OneToOne(() => Plot, plot => plot.plant, { nullable: true })
  plot: Plot;

  @ManyToOne(() => Item,{ nullable: true })
  @JoinColumn({ name: 'seedId' })
  seed: Item;
}
