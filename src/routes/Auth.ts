import { Container } from "typedi";
import { Router } from "express";
import AuthController from "../controllers/AuthController";

const auth: Router = Router();
const authController: AuthController = Container.get(AuthController);

auth.post("/login", authController.login);
auth.post("/register", authController.register);
auth.post("/refresh-token", authController.refreshToken);

export default auth;
