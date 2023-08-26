import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './users.entity';
import { File } from './file.entity';

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

    @OneToMany(() => File, file => file.folder)
    files: File[];
}