import { NextFunction, Request, Response } from "express";
import { findUser } from "../services/user.service";

export const isAdmin = async (req: Request, res: Response, next:NextFunction) =>{
   try {
     const user: userData = await findUser(req.oidc).then()
     return user.role === "ADMIN"? next() : res.status(403).send("user does not meet the requiments")
   } catch (error) {
        res.status(404).send("user not found")
   }
}

export const isTeacherOrAdmin = async (req: Request, res: Response, next:NextFunction) =>{
    try {
      const user: userData = await findUser(req.oidc).then()
      return user.role === "TEACHER" || user.role === "ADMIN" ? next() : res.status(403).send("user does not meet the requiments")
    } catch (error) {
         res.status(404).send("user not found")
    }
 }