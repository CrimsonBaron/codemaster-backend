import express  from "express";
import { root } from "../controllers/index.controller";

const indexRouter = express.Router();

indexRouter.get("/", root);

export default indexRouter;