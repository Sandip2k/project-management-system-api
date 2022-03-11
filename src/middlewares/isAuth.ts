import express from "express";
import jwt from "jsonwebtoken";

export const isAuth = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
) => {
    const authHeader =
        req.headers.authorization?.startsWith("Bearer ") &&
        req.headers.authorization;

    try {
        if (!authHeader) {
            res.sendStatus(401);
        } else {
            const token = authHeader.split(" ")[1];

            if (process.env.JWT_ACCESS_SECRET) {
                const payload = jwt.verify(
                    token,
                    process.env.JWT_ACCESS_SECRET
                );

                req.payload = payload;
            }

            next();
        }
    } catch (error) {
        res.sendStatus(401);
    }
};
