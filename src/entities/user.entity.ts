import { Column, Entity,PrimaryGeneratedColumn, Unique } from "typeorm";
import { RoleEnum } from "src/core/enums/roles.enum";

@Entity("tb_user")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  appId: string;

  @Column({ length: 30 })
  @Unique(['username'])
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ 
    type: 'simple-array',
    nullable: false,
    transformer: {
      to: (value: RoleEnum[]) => Array.isArray(value) ? value.join(',') : '0',
      from: (value: unknown): RoleEnum[] => {
        if (!value) return [RoleEnum.USER];
        if (Array.isArray(value)) return value;
        return String(value).split(',').map(v => v.trim() as RoleEnum);
      }
    }
  })
  roles: RoleEnum[];

  @Column({})
  nickname: string;

  @Column({ nullable: true })
  active: number

  @Column()
  salt: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  create_time: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  update_time: Date;
}

