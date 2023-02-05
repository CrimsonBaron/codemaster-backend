import express  from "express";
import { requiresAuth } from "express-openid-connect";
import path from "path";
import { createUser } from "../middlewares/user.middleware";


const indexRouter = express.Router();

indexRouter.use("/",[requiresAuth(), createUser]  ,express.static(path.resolve("public/dist/")));

export default indexRouter;