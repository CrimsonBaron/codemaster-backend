import { Request, Response } from "express";
import { createUserIfNotExist } from "../services/user.service";


export const root = (req: Request, res: Response) =>{
    if(!req.oidc.isAuthenticated()){
        return res.redirect("/login");
    }
    createUserIfNotExist(req.oidc);
    return  res.send("logged in");
}