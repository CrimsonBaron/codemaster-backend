import { RequestContext } from "express-openid-connect";
import { update } from "jdenticon";
import { db } from "../utils/db.utils";


export const getAllProjectsForUser = async (oidc: RequestContext) => {
    const { user } = oidc!;
    const foundUser = await db.user.findUnique({ where: { email: user!.email } });
    const projects = await db.userProjects.findMany({ where: { user: foundUser! }, include: { project: true } });
    const visibleProjects = await Promise.all(
        projects
        .filter(p => p.project.state !== "DELETED")
        .map(async userProject => {
            const isOwner = (await db.projectOwners.findFirst({
                where: { user: foundUser!, project: userProject.project },
                include: { user: true, project: true }
            }))? true : false;
            return {
                uuid: userProject.project.uuid,
                name: userProject.project.name,
                description: userProject.project.description || "",
                isOwner
            };
        })
    );
    return visibleProjects;
}

export const createProject = async (params: ProjectInput, oidc: RequestContext) => {
    try {
        const { user } = oidc!;
        const foundUser = await db.user.findUnique({ where: { email: user!.email } });
        const { name, description } = params;
        if (name === "") throw new Error("Incompatible name");
    
        await db.project.upsert({
          where: { name },
          update: {},
          create: {
            name,
            description,
            owners: { create: [{ user: { connect: { id: foundUser ? foundUser.id : 0 } } }] },
            users: { create: [{ user: { connect: { id: foundUser ? foundUser.id : 0 } } }] },
          },
        }).catch((e) => {
          console.error(e);
          throw new Error(e);
        });
      } catch (error) {
        throw new Error("Something went wrong");
      }
}

export const deleteProject = async (uuid: string) => {
    try {
        await db.project.update({
          where: { uuid },
          data: { state: "DELETED" }
        });
      } catch (error) {
        console.error(error);
        throw new Error("project does not exist");
      }
}

export const updateProject = async (uuid: string, params: ProjectInput) => {
    const { name, description } = params;

  const existingProject = await db.project.findUnique({ where: { name } });
  if (existingProject) {
    throw new Error("A project with that name already exists.");
  }

  await db.project.update({
    where: { uuid },
    data: { name, description }
  })
    .then(async () => {
      await db.$disconnect();
    })
    .catch(async (error) => {
      console.error(error);
      await db.$disconnect();
      throw new Error(error);
    });
}

export const addOwnerToProject = async (userUuid: string, projectUuid: string) => {
    try {
        const user = await db.user.findUnique({
            where: {
                uuid: userUuid
            }
        });
        await db.project.update({
            where: { uuid: projectUuid },
            data: {
                owners: {
                    create: [{ user: { connect: { id: user?.id || 0 } } }]
                },
                users: {
                    create: [{ user: { connect: { id: user?.id || 0 } } }]
                }
            }
        });
    } catch (error) {
        console.error(error);
        throw new Error("something went wrong");
    }
}

export const addOwnersToProject = async (projectUuid: string, userUuids: string[]) => {
    try {
        const users = await db.user.findMany({
          where: { uuid: { in: userUuids } }
        });
    
        const query = users.map(usr => ({ user: { connect: { id: usr?.id || 0 } } }));
    
        await db.project.update({
          where: { uuid: projectUuid },
          data: { owners: { create: query }, users: { create: query } }
        });
    
        return;
      } catch (error) {
        console.error(error);
        throw new Error("something went wrong");
      }
}

export const addUserToProject = async (userUuid: string, projectUuid: string) => {
    try {
        const user = await db.user.findUnique({
          where: { uuid: userUuid },
        });
    
        await db.project.update({
          where: { uuid: projectUuid },
          data: {
            users: {
              create: [{ user: { connect: { id: user?.id || 0 } } }],
            },
          },
        });
      } catch (error) {
        console.error(error);
        throw new Error("something went wrong");
      }
}

export const removeOwnerFromProject = async (userUuid: string, projectUuid: string) => {
    try {
        const [user, project] = await Promise.all([
            db.user.findUnique({ where: { uuid: userUuid } }),
            db.project.findUnique({ where: { uuid: projectUuid } })
        ]);

        await db.projectOwners.delete({
            where: {
                userId_projectId: {
                    userId: user!.id ,
                    projectId: project!.id
                }
            }
        });
        return;
    } catch (error) {
        console.error(error);
        throw new Error("something went wrong");
    }
}

export const removeOwnersFromProject = (projectUuid: string, userUuids: string[]) => {
    return userUuids.map(async (userUuid) => {
        await removeOwnerFromProject(userUuid, projectUuid);
    })
}

export const removeUserFromProject = async (userUuid: string, projectUuid: string) => {
    try {
        const [user, project] = await Promise.all([
            db.user.findUnique({ where: { uuid: userUuid } }),
            db.project.findUnique({ where: { uuid: projectUuid } })
        ])

        await db.userProjects.delete({
            where: {
                project_id_user_id: {
                    project_id: project!.id ,
                    user_id: user!.id ,
                }
            }
        })
        return;
    } catch (error) {
        console.error(error);
        throw new Error("something went wrong")
    }
}

export const removeUsersFromProject = (projectUuid: string, userUuids: string[]) => {
    return userUuids.map(async (userUuid) => {
        await removeUserFromProject(userUuid, projectUuid);
    })
}

export const searchForProjectBasedOnKeyword = async (oidc: RequestContext, keyword: string) => {
    try {
        const { user } = oidc;
        if (!user || keyword === "") { throw new Error("invalid oidc or keyword") };
    
        const foundProjects = await db.project.findMany({
          where: {
            name: { search: keyword },
            users: { some: { user: { email: user.email } } }
          },
          include: { users: { include: { user: true, project: false } } }
        });
    
        const sortedProjects = await Promise.all(foundProjects.map(async project => {
          if (project.state !== "DELETED") {
            const { description, name, uuid } = project;
            const isOwner = !!(await db.projectOwners.findFirst({
              where: { user: { name: user.email }, projectId: project.id },
              include: { user: true, project: true }
            }));
    
            return { uuid, name, description: description || '', isOwner };
          }
          return null;
        }));
    
        return sortedProjects.filter(Boolean);
      } catch (error) {
        console.error(error);
        throw new Error("something went wrong");
      }

}