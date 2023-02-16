import { ExerciseLevel } from "@prisma/client";
import { RequestContext } from "express-openid-connect";
import { ExerciseInput } from "../types/exerciseData.types";
import { db } from "../utils/db.utils";


export const getAllExercisesForProject = async (oidc: RequestContext, projectUuid: string) => {
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

export const createExerciseForProject =async (projectUuid:string, exerciseInput: ExerciseInput) => {
    const {name, task, level,tries,deadline} = exerciseInput
    const project = await db.project.findUnique({where:{uuid:projectUuid}})
    await db.exercise.upsert({
      where: {name: exerciseInput.name,},
      update: {},
      create: {name,task,level,tries: tries==0? 1: tries,deadline,projectId: project!.id}
    })
}

export const deleteExistingExercise =async (exerciseUuid:string) => {
    await db.exercise.update({
      where:{uuid:exerciseUuid},
      data:{state: "DELETED"}
    })
}

export const updateExistingExercise =async (exerciseUuid:string, exerciseInput: ExerciseInput) => {
    const { name, task, level, tries, deadline } = exerciseInput;
    const existingExercise = await db.exercise.findUnique({ where: { name } });
    if (existingExercise && existingExercise.uuid != exerciseUuid) {
      throw new Error("A exercse with that name already exists.");
    }
    await db.exercise.update({
      where:{ uuid: exerciseUuid,},
      data:{name,task,level,tries: tries==0? 1: tries,deadline }
    })
}

export const searchForExistingExercsie = async (keyword: string, projectUuid: string) => {
  if (!keyword) throw new Error("invalid keyword");
  
  const foundExercises = await db.exercise.findMany({
    where: {
      Project: { uuid: projectUuid },
      name: { search: keyword }
    }
  });

  return foundExercises
    .filter((exercise) => exercise.state !== "HIDDEN" && exercise.state !== "DELETED")
    .map((exercise) => ({
      uuid: exercise.uuid,
      name: exercise.name,
      task: exercise.task,
      level: exercise.level,
      tries: exercise.tries,
      deadline: exercise.deadline
    }));
};

export const submitExercise = (oidc:RequestContext, exerciseUuid:string, code:string) =>{

}