import { Request, Response } from "express";
import { findUser  } from "../services/user.service";

export const getUser = async (req: Request, res: Response) =>{
    try {
        const foundUser = await findUser(req.oidc)
        return res.status(200).send(foundUser)
    } catch (error) {
        console.log(error);
        return res.status(404).send("user not found")
    }
}