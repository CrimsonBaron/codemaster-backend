import { ExerciseLevel } from "@prisma/client"

declare interface ExerciseData {
    uuid: string
    name: string
    task: string,
    level: string,
    tries: number,
    deadline: Date
}

declare interface ExerciseInput {
    name: string
    task: string,
    level: ExerciseLevel,
    tries: number,
    deadline: Date
}
