import { User } from "../models/User";
import {
    createAccessToken,
    createRefreshToken,
} from "./../services/AuthService";
import { Service } from "typedi";
import express from "express";
import AuthService from "../services/AuthService";
import LoginResponse from "../@types/LoginResponse";
import LoginUserInput from "../@types/LoginUserInput";
import jwt from "jsonwebtoken";
import client from "../config/redis";

import RegisterUserInput from "src/@types/RegisterUserInput";

@Service()
export default class AuthController {
    // Injected.
    constructor(private readonly authService: AuthService) {}

    login = async (req: express.Request, res: express.Response) => {
        try {
            const loginUserInput: LoginUserInput = req.body; // get email and password from req.body
            const result: boolean = await this.authService.login(
                // use the service to attempt a login.
                loginUserInput
            );
            if (!result) {
                // login failed.
                res.status(400);
                return res.json("Invalid username or password.");
            } else {
                const user = await User.findOne({
                    // find the user with given email.
                    where: { email: loginUserInput.email },
                });
                if (user === undefined) {
                    // there is some error here.
                    return res.sendStatus(500);
                } else {
                    const refreshToken = createRefreshToken(user); // user exists, create a refresh token for this user.

                    let noError = false;

                    try {
                        // store this refresh token with user's id as key, set to expire in 24 * 7 * 60 * 60 secs
                        const result = await client.set(
                            user.id.toString(),
                            refreshToken.toString(),
                            "EX",
                            24 * 7 * 60 * 60
                        );
                        if (result === "OK") {
                            // redis set operation was successful.
                            noError = true;
                        }
                    } catch (error) {
                        // redis error has occurred.
                        console.log(error);
                        return res.sendStatus(500);
                    }

                    if (noError) {
                        res.cookie("jid", refreshToken, {
                            // set the refresh token as jid httpOnly cookie, on the path "/refresh-token"
                            httpOnly: true,
                            path: "/auth/refresh-token",
                        });

                        const loginResponse: LoginResponse = {
                            user,
                            accessToken: createAccessToken(user),
                        };
                        res.status(200);
                        return res.json(loginResponse);
                    }
                    return res.sendStatus(500);
                }
            }
        } catch (err) {
            console.log(err);
            return res.sendStatus(500);
        }
    };

    register = async (
        req: express.Request,
        res: express.Response
    ): Promise<void> => {
        const registerUserInput: RegisterUserInput = req.body;
        try {
            const result: boolean = await this.authService.register(
                registerUserInput
            );

            if (!result) {
                res.status(400);
                res.json("A user with this email already exists.");
            } else {
                res.status(200);
                res.json("User registered successfully.");
                // TODO: SEND VERIFICATION EMAIL
            }
        } catch (err) {
            console.log(err);
        }
    };

    refreshToken = async (req: express.Request, res: express.Response) => {
        const token = req.cookies.jid;

        if (!token) {
            // if there's no refresh token as sent cookie jid.
            return res.send({ ok: false, accessToken: "" });
        }

        let payload: any = null;
        try {
            if (process.env.JWT_REFRESH_SECRET) {
                payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET); // verify the sent refresh token
            }
        } catch (error) {
            // on failure of verification.
            console.log(error);
            return res.send({ ok: false, accessToken: "" });
        }

        const user = await User.findOne(payload.userId); // find the user with the id

        if (!user) {
            // if user doesn't exist
            return res.send({ ok: false, accessToken: "" });
        }

        const newRefreshToken = createRefreshToken(user); // create a new refresh token

        try {
            const getToken = await client.get(user.id.toString()); // get the current refresh token with this user's id.
            if (token === getToken) {
                // if token sent as cookie matches with the one from redis.
                const setToken = await client.set(
                    // set the new token in redis, essentially blacklisting the current one.
                    user.id.toString(),
                    newRefreshToken.toString(),
                    "EX",
                    24 * 7 * 60 * 60
                );

                if (setToken === "OK") {
                    // set operation was successful.
                    res.cookie("jid", newRefreshToken, {
                        // update the cookie jid too, set cookie with new refresh token.
                        httpOnly: true,
                        path: "/auth/refresh-token",
                    });

                    return res.send({
                        ok: true,
                        accessToken: createAccessToken(user),
                    });
                } else {
                    // something is wrong, sent token doesn't match with the redis value.
                    return res.send({ ok: false, accessToken: "" });
                }
            }
        } catch (error) {
            console.log(error);
            return res.sendStatus(500);
        }

        return res.send({ ok: false, accessToken: "" });
    };
}
