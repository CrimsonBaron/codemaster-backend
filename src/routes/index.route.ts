import express  from "express";
import { requiresAuth } from "express-openid-connect";
import { root } from "../controllers/index.controller";

const indexRouter = express.Router();

indexRouter.get("/", requiresAuth() ,root);

export default indexRouter;