import { Request, Response } from "express";
import { createExerciseForProject, deleteExistingExercise, getAllExercisesForProject, searchForExistingExercsie, updateExistingExercise } from "../services/exercise.service";
import { ExerciseData } from "../types/exerciseData.types";


export const getExercises = async (req: Request, res: Response) => {
    const { projectUuid } = req.body;
    try {
        const exercises: (void | ExerciseData)[] = await getAllExercisesForProject(req.oidc, projectUuid);
        res.status(200).send(exercises);
    } catch (error) {
        return res.status(404).send("oops something went wrong!")
    }
};

export const createExercise = async (req: Request, res: Response) => {
    const { projectUuid } = req.body;
    const { exercise } = req.body.data;
    try {
        await createExerciseForProject(projectUuid, exercise);
        return res.status(200).send("OK!");
    } catch (error) {
        return res.status(500).send("cannot create exercise")
    }
}

export const deleteExercise = async (req: Request, res: Response) => {
    const { exerciseUuid } = req.body;
    try {
        await deleteExistingExercise(exerciseUuid);
        return res.status(200).send("OK!");
    } catch (error) {
        return res.status(500).send("cannot delete exercise")
    }
}

export const updateExercise = async (req: Request, res: Response) => {
    const { exerciseUuid } = req.body;
    const { exercise } = req.body.data;
    try {
        await updateExistingExercise(exerciseUuid, exercise);
        return res.status(200).send("OK!");
    } catch (error) {
        return res.status(500).send("cannot update exercise")
    }
}

export const searchExercise = async (req: Request, res: Response) => {
    const { projectUuid } = req.body;
    const { keyword } = req.body.data;
    try {
        const exercise: ExerciseData[] = await searchForExistingExercsie(keyword, projectUuid);
        return res.status(200).send(exercise);
    } catch (error) {
        return res.status(500).send("cannot update exercise")
    }
}