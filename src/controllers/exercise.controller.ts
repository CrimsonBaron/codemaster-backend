import { Request, Response } from "express";
import { getAllExercisesForProject } from "../services/exercise.service";
import { ExerciseData } from "../types/exerciseData.types";


export const getExercises =async (req:Request, res:Response) => {
    const {projectUuid} = req.body;
    try {
        const exercises: (void | ExerciseData)[] =  await getAllExercisesForProject(req.oidc, projectUuid);
        res.status(200).send(exercises);
    } catch (error) {
        return res.status(404).send("oops something went wrong!")
    }
};

export const createExercise =async (req:Request, res:Response) => {
    
}