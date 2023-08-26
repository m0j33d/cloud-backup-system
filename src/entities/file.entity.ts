import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './users.entity';
import { Folder } from "./folder.entity";

export enum FileStatus {
    SAFE = 'safe',
    UNSAFE = 'unsafe',
}

@Entity()
export class File {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fileName: string;

    @Column()
    fileSize: string;

    @Column()
    userId: number;

    @Column({ unique: true })
    fileSlug: string

    @Column({ unique: true })
    url: string

    @Column()
    mimeType: string

    @Column({
        type: 'enum',
        enum: FileStatus, 
        default: FileStatus.SAFE, 
    })
    status: FileStatus;

    @Column('text', { array: true, nullable: true })
    markedBy: string[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column({ type: 'timestamp', nullable: true })
    deleted_at: Date;
        
    // Method for soft deletion
    softDelete() {
        this.deleted_at = new Date();
    }

    @ManyToOne(() => Folder, {
        nullable: true
    })
    'folder': Folder;

    // Define the many-to-one relationship with User
    @ManyToOne(() => User, (user) => user.file)
    user: User;
}