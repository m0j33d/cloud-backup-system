import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { File } from './file.entity';
import { Exclude } from 'class-transformer';

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
    @Exclude({ toPlainOnly: true })
    password: string;

    @Column({ default: true })
    isActive: boolean

    @Column({
        type: 'enum',
        enum: UserType,
        default: UserType.USER,
    })
    @Exclude({ toPlainOnly: true })
    userType: UserType;

    // Establish a one-to-many relationship with File
    @OneToMany(() => File, (file) => file.user)
    file: File[];
}