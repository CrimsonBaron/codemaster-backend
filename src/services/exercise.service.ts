import { RequestContext } from "express-openid-connect";
import { db } from "../utils/db.utils";


export const getAllExercisesForProject =async (oidc:RequestContext, projectUuid:string) => {
    const { user } = oidc!;
    const foundExercises = await db.project.findFirst({
      where: {
        uuid: projectUuid
      },
      include: { exercises: true }
    });
  
    const isOwner = await db.projectOwners.findFirst({
      where: {
        project: {
          uuid: projectUuid
        },
        user: {
          email: user!.email
        }
      }
    }) ? true : false;
  
    const visibleExercises = foundExercises!.exercises
      .map(exercise => {
        if (isOwner || (exercise.state !== "HIDDEN" && exercise.state !== "DELETED")) {
          return {
            uuid: exercise.uuid,
            name: exercise.name,
            task: exercise.task,
            level: exercise.level,
            tries: exercise.tries,
            deadline: exercise.deadline
          };
        }
      })
      .filter(Boolean);
  
    return visibleExercises;
}

export const createExerciseForProject =async (oidc:RequestContext, projectUuid:string, exerciseInput: ExerciseInput) => {
    const {user} = oidc!;
    const {name, task, level,tries,deadline} = exerciseInput
    await db.exercise.upsert({
        where: {
            name: exerciseInput.name,
        },
        update:{},
        create:{
            name,
            task,
            level,
            
        }

    })

}