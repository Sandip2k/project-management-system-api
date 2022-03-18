import { Role } from "../models/User";
import { Service } from "typedi";
import { getRepository } from "typeorm";
import { User } from "../models/User";
import CreateUserInput from "../@types/CreateUserInput";
import bcrypt from "bcryptjs";

@Service()
class UserService {
    findAll = async (): Promise<User[]> => {
        try {
            return await getRepository(User).find();
        } catch (err) {
            throw err;
        }
    };

    findUserById = async (id: number): Promise<User | undefined> => {
        try {
            return await getRepository(User).findOne(id);
        } catch (err) {
            throw err;
        }
    };

    userExists = async (email: string): Promise<boolean> => {
        try {
            const user = await getRepository(User).findOne({ email });
            if (user === undefined) return false;
            return true;
        } catch (err) {
            throw err;
        }
    };

    createUser = async (payload: CreateUserInput): Promise<boolean> => {
        try {
            const { firstName, lastName, email, password, role } = payload;

            const doesUserExist: boolean = await this.userExists(email);

            if (doesUserExist) return false;

            const hashedPassword = await bcrypt.hash(password, 12);
            const user: User = getRepository(User).create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                isActive: true,
                role: role === "admin" ? Role.ADMIN : Role.USER,
            });

            await user.save();

            return true;
        } catch (err) {
            throw err;
        }
    };
}

export default UserService;
