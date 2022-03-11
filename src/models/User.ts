import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";

export enum Role {
    USER = "user",
    ADMIN = "admin",
}

@Entity({ name: "users" })
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column("text", { unique: true })
    email!: string;

    @Column({ select: false })
    password!: string;

    @Column()
    isActive: boolean = false;

    @Column({
        type: "enum",
        enum: Role,
        default: Role.USER,
    })
    role: Role = Role.USER;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
