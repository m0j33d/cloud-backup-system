import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './users.entity';

export enum SessionStatus {
    ACTIVE = 'active',
    REVOKED = 'revoked',
}

@Entity()
export class Session {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: SessionStatus,
        default: SessionStatus.ACTIVE,
    })
    status: SessionStatus;

    @CreateDateColumn()
    created_at: Date;

    // Define the one-to-one relationship with User
    @OneToOne(() => User)
    @JoinColumn()
    user: User;
}