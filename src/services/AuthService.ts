import bcrypt from "bcryptjs";
import { Service } from "typedi";
import { getRepository } from "typeorm";
import LoginUserInput from "../@types/LoginUserInput";
import RegisterUserInput from "../@types/RegisterUserInput";
import { Role, User } from "./../models/User";

import jwt from "jsonwebtoken";

export const createAccessToken = (user: User) => {
    return jwt.sign(
        { userId: user.id },
        process.env.JWT_ACCESS_SECRET ||
            "somearbitrarilylongsecretthatyoushouldntcareabouttoomuch",
        {
            expiresIn: "15m",
        }
    );
};

export const createRefreshToken = (user: User) => {
    return jwt.sign(
        { userId: user.id },
        process.env.JWT_REFRESH_SECRET ||
            "somearbitrarilylongsecretthatyoushouldntcareabouttoomuchorelseyoulljustwasteyourtime",
        {
            expiresIn: "7d",
        }
    );
};

@Service()
class AuthService {
    login = async ({ email, password }: LoginUserInput): Promise<boolean> => {
        const user = await getRepository(User)
            .createQueryBuilder("User")
            .where("User.email = :email", { email })
            .addSelect("User.password")
            .getOne();

        if (user === undefined) return false;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return false;

        return true;
    };

    register = async ({
        firstName,
        lastName,
        email,
        password,
    }: RegisterUserInput): Promise<boolean> => {
        try {
            const existingUser: User | undefined = await User.findOne({
                where: { email },
            });

            if (!!existingUser) return false;

            const hashedPassword = await bcrypt.hash(password, 12);
            const user: User = getRepository(User).create({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                role: Role.USER,
            });

            await user.save();

            return true;
        } catch (err) {
            throw err;
        }
    };
}

export default AuthService;
