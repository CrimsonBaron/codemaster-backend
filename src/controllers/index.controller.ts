import { Request, Response } from "express";
import { createUserIfNotExist } from "../services/user.service";


export const root = (req: Request, res: Response) =>{
    createUserIfNotExist(req.oidc);
    return  res.send("logged in");
}