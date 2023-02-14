import { RequestContext } from "express-openid-connect";
import { db } from "../utils/db.utils";
import { addOwnerToProject, addUserToProject } from "./project.service";
import { findUser } from "./user.service";
import shortid from "shortid";

export const addusertoProjectBasedOnCode = async (code: string, oidc: RequestContext) => {
    if (!code) throw new Error("Invalid Code");
    const user = await findUser(oidc);
    try {
      const foundProject = await db.projectAccesCode.findFirst({
        where: { code: { code } },
        include: { project: true }
      });
      await addUserToProject(user!.uuid, foundProject!.project.uuid);
    } catch {
      const foundProject = await db.projectOwnerAccesCode.findFirst({
        where: { code: { code } },
        include: { project: true }
      });
      await addOwnerToProject(user!.uuid,foundProject!.project.uuid);
    }
};

export const generateCodeForProject =async (projectUuid:string) => {

    const foundCode = await db.projectAccesCode.findFirst({
        where:{
            project:{
                uuid:projectUuid
            }
        },
        include:{code:true, project:true}
    })
    if (foundCode!.code) {
        await db.accesCode.delete({
            where:{
                id: foundCode!.code.id
            }
        })
    }
    await db.accesCode.create({
        data:{
            projects: {
                create:[{project:{connect:{id: foundCode?.project.id}}}]
            },
            code: shortid.generate()
        }     
    })
}