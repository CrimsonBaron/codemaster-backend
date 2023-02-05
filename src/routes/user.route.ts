import express  from "express";
import { requiresAuth } from "express-openid-connect";
import { getUser } from "../controllers/user.controller";

const userRouter = express.Router();

userRouter.get("/",requiresAuth(),getUser)

export default userRouter;

