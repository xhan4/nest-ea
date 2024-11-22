import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('posts')
export class PostsEntity {
    @PrimaryGeneratedColumn() // 标记为主列，值自动生成
    id: number;
    @Column({ length: 50 })
    title: string;
    @Column({ length: 20 })
    author: string;
    @Column('text')
    content: string;
  
    @Column({ default: '' })
    thumb_url: string;
  
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    create_time: Date;
  
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    update_time: Date;
}
