import express  from "express";
import { requiresAuth } from "express-openid-connect";
import { createExercise, deleteExercise, getExercises, searchExercise, updateExercise } from "../controllers/exercise.controller";

const exerciseRouter = express.Router();

exerciseRouter.get("/:projectUuid", getExercises);
exerciseRouter.delete("/delete/:exerciseUuid",deleteExercise);
exerciseRouter.post("/create/:projectUuid", createExercise);
exerciseRouter.put("/update/:exerciseUuid", updateExercise);
exerciseRouter.post("/create/:projectUuid", searchExercise);

export default exerciseRouter;