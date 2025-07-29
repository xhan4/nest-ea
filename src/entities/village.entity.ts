import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Sect } from "./sect.entity";

@Entity("tb_village")
export class Village {
  @PrimaryGeneratedColumn()
  id: number;

  // @ManyToOne(() => Sect, sect => sect.villages)
  // sect: Sect;

  @Column({ length: 100 })
  name: string;

  @Column({ default: 100 })
  population: number;

  @Column({ type: 'float', default: 0.1 })
  tax_rate: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  protected_since: Date;
}
