import { Role } from "./../models/User";
export default interface CreateUserInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
}
