import express  from "express";
import { requiresAuth } from "express-openid-connect";
import { getExercises } from "../controllers/exercise.controller";

const exerciseRouter = express.Router();

exerciseRouter.get("/:projectUuid", getExercises);

export default exerciseRouter;