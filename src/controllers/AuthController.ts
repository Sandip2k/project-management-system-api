import { createAccessToken } from "./../services/AuthService";
import express from "express";
import { User } from "../models/User";
import AuthService from "../services/AuthService";
import LoginResponse from "../@types/LoginResponse";
import LoginUserInput from "../@types/LoginUserInput";
import { Service } from "typedi";

@Service()
export default class AuthController {
    constructor(private readonly authService: AuthService) {}

    login = async (
        req: express.Request,
        res: express.Response
    ): Promise<void> => {
        try {
            const loginUserInput: LoginUserInput = req.body;
            const result: boolean = await this.authService.login(
                loginUserInput
            );
            if (!result) {
                res.status(400);
                res.json("Invalid username or password.");
            } else {
                const user = await User.findOne({
                    where: { email: loginUserInput.email },
                });
                if (user === undefined) {
                    res.sendStatus(500);
                } else {
                    const loginResponse: LoginResponse = {
                        user,
                        accessToken: createAccessToken(user),
                    };
                    res.status(200);
                    res.json(loginResponse);
                }
            }
        } catch (err) {
            console.log(err);
        }
    };
}
