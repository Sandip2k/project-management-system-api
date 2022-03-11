import { JwtPayload } from "jsonwebtoken";
import { User } from "../../models/User";

declare global {
    namespace Express {
        export interface Request {
            payload: undefined | string | JwtPayload;
        }
    }
}
