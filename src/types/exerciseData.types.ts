import { ExerciseLevel } from "@prisma/client"

export declare interface ExerciseData {
    uuid: string
    name: string
    task: string,
    level: string,
    tries: number,
    deadline: Date
}

export declare interface ExerciseInput {
    name: string
    task: string,
    level: ExerciseLevel,
    tries: number,
    deadline: Date
}
