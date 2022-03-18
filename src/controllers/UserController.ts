import { User } from "./../models/User";
import express from "express";
import { Service } from "typedi";
import UserService from "../services/UserService";
import CreateUserInput from "../@types/CreateUserInput";

@Service()
export default class UserController {
    constructor(private readonly userService: UserService) {}

    getAll = async (req: express.Request, res: express.Response) => {
        try {
            const users: User[] = await this.userService.findAll();
            res.json(users);
        } catch (err) {
            console.log(err);
        }
    };

    get = async (req: express.Request, res: express.Response) => {
        try {
            const { id } = req.params;
            const user: User | undefined = await this.userService.findUserById(
                Number(id)
            );
            if (user === undefined) {
                res.status(404);
            } else {
                res.status(200);
                res.json(user);
            }
        } catch (err) {
            console.log(err);
        }
    };

    post = async (req: express.Request, res: express.Response) => {
        try {
            const payload: CreateUserInput = req.body;

            const createUserResult = await this.userService.createUser(payload);

            if (!createUserResult) res.sendStatus(400);
            else res.sendStatus(200);
        } catch (err) {
            console.log(err);
        }
    };
}
