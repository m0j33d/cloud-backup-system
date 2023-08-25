import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne } from 'typeorm';
import { User } from './users.entity';

@Entity()
export class Session {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 'active' })
    status: string;

    @CreateDateColumn()
    created_at: Date;

    // Define the one-to-one relationship with User
    @OneToOne(() => User)
    user: User;
}