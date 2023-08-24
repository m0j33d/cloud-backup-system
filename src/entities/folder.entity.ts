import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './users.entity';

@Entity()
export class Folder {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    folderName: string;

    @Column()
    slug: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    // Define the many-to-one relationship with User
    @ManyToOne(() => User)
    user: User;
}