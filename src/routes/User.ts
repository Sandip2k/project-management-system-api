import { isAuth } from "./../middlewares/isAuth";
import { Container } from "typedi";
import { Router } from "express";
import UserController from "../controllers/UserController";

const user: Router = Router();
const userController: UserController = Container.get(UserController);

user.use(isAuth);

user.get("/", userController.getAll);
user.get("/:id", userController.get);
user.post("/", userController.post);

export default user;
