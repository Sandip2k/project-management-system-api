import { User } from "../models/User";
export default interface LoginResponse {
    user: User;
    accessToken: string;
}
