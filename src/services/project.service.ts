import { RequestContext } from "express-openid-connect";
import { update } from "jdenticon";
import { db } from "../utils/db.utils";


export const getAllProjectsForUser = async (oidc: RequestContext) => {
    const { user } = oidc;
    if (!user) {
        throw new Error("Invalid oidc user")
    }

    const foundUser = await db.user.findUnique({
        where: {
            email: user.email
        }
    })

    if (!foundUser) {
        throw new Error("user does not exist");
    }

    const projects = await db.userProjects.findMany({
        where: {
            user: foundUser
        },
        include: { project: true }
    })

    if (!projects) {
        throw new Error("no projects found");
    }

    const visibleProjects: ProjectData[] = [];

    projects.map(async (userProject) => {
        if (userProject.project.state !== "DELETED") {
            const { description, name, uuid } = userProject.project;
            const isOwner: boolean = await db.projectOwners.findFirst({
                where: {
                    user: foundUser,
                    project: userProject.project
                },
                include: { user: true, project: true }
            }) != null ? true : false;
            visibleProjects.push({
                uuid,
                name,
                description: description != null ? description : "",
                isOwner
            })
        }
    })
    return visibleProjects;
}

export const createProject = async (params: ProjectInput, oidc: RequestContext) => {
    try {
        const { user } = oidc;
        const foundUser = await db.user.findUnique({
            where: {
                email: user ? user.email : ""
            }
        })
        const { name, description } = params
        if (name === "") {
            throw new Error("incopatible name");
        }

        const newProject = await db.project.upsert({
            where: {
                name: name
            },
            update: {},
            create: {
                name: name,
                description: description,
                owners: {
                    create: [
                        { user: { connect: { id: foundUser ? foundUser.id : 0 } } }
                    ]
                },
                users: {
                    create: [
                        { user: { connect: { id: foundUser ? foundUser.id : 0 } } }
                    ]
                }
            }
        }).then(async () => {
            await db.$disconnect()
        })
            .catch(async (e) => {
                console.error(e)
                await db.$disconnect()
                throw new Error(e)
            })
        return;
    } catch (error) {
        throw new Error("something went wrong")
    }
}

export const deleteProject = async (uuid: string) => {
    try {
        await db.project.update({
            where: {
                uuid: uuid
            },
            data: {
                state: "DELETED"
            }
        }).then(async () => {
            await db.$disconnect()
        })
            .catch(async (e) => {
                console.error(e)
                await db.$disconnect()
                throw new Error(e)
            })

    } catch (error) {
        console.error(error);
        throw new Error("project does not exist");
    }
}

export const updateProject = async (uuid: string, params: ProjectInput) => {
    const { name, description } = params
    try {
        await db.project.findUnique({
            where: {
                name: name
            }
        })
        throw new Error("project alredy exist with specified name")
    } catch (error) {
        await db.project.update({
            where: {
                uuid: uuid
            },
            data: {
                name: name,
                description: description
            }
        }).then(async () => {
            await db.$disconnect()
        })
            .catch(async (e) => {
                console.error(e)
                await db.$disconnect()
                throw new Error(e)
            })
        return;
    }
}

export const addOwnerToProject = async (userUuid: string, projectUuid: string) => {
    try {
        const user = await db.user.findUnique({
            where: {
                uuid: userUuid
            }
        })

        await db.project.update({
            where: {
                uuid: projectUuid
            },
            data: {
                owners: {
                    create: [
                        { user: { connect: { id: user ? user.id : 0 } } }
                    ]
                },
                users: {
                    create: [
                        { user: { connect: { id: user ? user.id : 0 } } }
                    ]
                },
            }
        })

        return;
    } catch (error) {
        console.error(error);
        throw new Error("something went wrong")
    }
}

export const addOwnersToProject = async (projectUuid: string, userUuids: string[]) => {
    try {
        const users = await db.user.findMany({
            where: {
                uuid: { in: userUuids }
            }
        })

        const query: { user: { connect: { id: number } } }[] = [];

        users.map((usr) => {
            query.push(
                { user: { connect: { id: usr ? usr.id : 0 } } }
            )
        })

        await db.project.update({
            where: {
                uuid: projectUuid
            },
            data: {
                owners: {
                    create: query
                },
                users: {
                    create: query
                }
            }
        })
        return;
    } catch (error) {
        console.error(error);
        throw new Error("something went wrong")
    }
}

export const addUserToProject = async (userUuid: string, projectUuid: string) => {
    try {
        const user = await db.user.findUnique({
            where: {
                uuid: userUuid
            }
        })

        await db.project.update({
            where: {
                uuid: projectUuid
            },
            data: {
                users: {
                    create: [
                        { user: { connect: { id: user ? user.id : 0 } } }
                    ]
                }
            }
        })

    } catch (error) {
        console.error(error);
        throw new Error("something went wrong")
    }
}

export const removeOwnerFromProject =async (userUuid: string, projectUuid: string) => {
    try {
        const user = await db.user.findUnique({
            where: {
                uuid: userUuid
            }
        })

        const project = await db.project.findUnique({
            where:{
                uuid: projectUuid
            }
        })

        await db.projectOwners.delete({
            where:{
                userId_projectId:{
                    userId: user? user.id:0,
                    projectId: project? project.id :0 
                }
            }
        })
        return;
    } catch (error) {
        console.error(error);
        throw new Error("something went wrong")
    }
}

export const removeOwnersFromProject =(projectUuid: string, userUuids: string[]) => {
    return userUuids.map(async (userUuid)=>{
        await removeOwnerFromProject(userUuid,projectUuid);
    })
}

export const removeUserFromProject =async (userUuid: string, projectUuid: string) => {
    try {
        const user = await db.user.findUnique({
            where: {
                uuid: userUuid
            }
        })

        const project = await db.project.findUnique({
            where:{
                uuid: projectUuid
            }
        })

        await db.userProjects.delete({
            where:{
                project_id_user_id: {
                    project_id: project? project.id:0,
                    user_id: user? user.id: 0,
                }
            }
        })
        return;
    } catch (error) {
        console.error(error);
        throw new Error("something went wrong")
    }
}

export const removeUsersFromProject =(projectUuid: string, userUuids: string[]) => {
    return userUuids.map(async (userUuid)=>{
        await removeUserFromProject(userUuid,projectUuid);
    })
}

export const searchForProjectBasedOnKeyword =async (oidc: RequestContext, keyword: string) => {
    try {
        const {user} = oidc;
        if(!user) {throw new Error("invalid oidc")};
        if(keyword !== "") {throw new Error("invalid oidc")};
    
        const foundUser = await db.user.findUnique({
            where:{
                email: user.email
            }
        })
    
        if(!foundUser) {throw new Error("invalid oidc")};
    
        const foundProjects =await db.project.findMany({
            where:{
                name:{
                    search: keyword
                }
            }
        });
        const sortedProjects: ProjectData[] = [];
        foundProjects.map(async (project) => {
            const isInProject = await db.userProjects.findFirst({
                where:{
                    project: project,
                    user: foundUser
                }
            });
            if(isInProject && project.state !== "DELETED"){
                    const { description, name, uuid } = project;
                    const isOwner: boolean = await db.projectOwners.findFirst({
                        where: {
                            user: foundUser,
                            project: project
                        },
                        include: { user: true, project: true }
                    }) != null ? true : false;
                    sortedProjects.push({
                        uuid,
                        name,
                        description: description != null ? description : "",
                        isOwner
                    })
            }
        })
    } catch (error) {
        console.log(error);
        throw new Error("something went wrong");
        
    }

}