declare interface ProjectData {
    uuid: string
    name: string
    description: string,
    isOwner: boolean
}

declare interface ProjectInput {
    name: string
    description: string,
}