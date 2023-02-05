import { NextFunction, Request, Response } from "express";
import { createUserIfNotExist } from "../services/user.service";


export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await createUserIfNotExist(req.oidc);
        return next();
    } catch (error) {
        console.error(error);
        return res.status(500).send("something went wrong")
    }
}
