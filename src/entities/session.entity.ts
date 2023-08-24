import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne } from 'typeorm';
import { User } from './users.entity';

@Entity()
export class Session {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    created_at: Date;

    // Define the many-to-one relationship with User
    @OneToOne(() => User)
    user: User;
}