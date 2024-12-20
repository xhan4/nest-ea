import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn, Unique } from "typeorm";
import * as crypto from "crypto";
import encryption from "src/utils/crypto";
@Entity("tb_user")
export class User {
    @PrimaryGeneratedColumn() // 标记为主列，值自动生成
    id:number;

    @Column({ length: 30 })
    @Unique(['username'])
    username:string;

    @Column()
    password:string;

    @Column({nullable:true})
    avatar:string;

    @Column()
    role:string;
  

    @Column({nullable:true})
    nickname:string;

    @Column({nullable: true})
    active:number

    @Column({ nullable: true })
    salt: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    create_time: Date;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    update_time: Date;
    
    @BeforeInsert()
    beforeInsert() {
      this.salt = crypto.randomBytes(4).toString("base64");
      this.password = encryption(this.password, this.salt);
    }
}