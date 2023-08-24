import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { File } from './file.entity';

enum UserType {
    USER = 'user',
    ADMIN = 'admin',
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ default: true })
    isActive: boolean

    @Column({
        type: 'enum',
        enum: UserType,
        default: UserType.USER,
    })
    userType: UserType;

    // Establish a one-to-many relationship with File
    @OneToMany(() => File, (file) => file.user)
    file: File[];
}