import { Request, Response } from "express";
import { addOwnersToProject,searchForProjectBasedOnKeyword ,addOwnerToProject, createProject, deleteProject, getAllProjectsForUser, removeOwnerFromProject, removeOwnersFromProject, removeUserFromProject, removeUsersFromProject, updateProject } from "../services/project.service";

export const getAllProjects = async (req:Request, res:Response) =>{
    try {
        const projects: ProjectData[] =await getAllProjectsForUser(req.oidc);
        return res.status(200).send(projects);
    } catch (error) {
        return res.status(404).send("no project found for user")
    }
}

export const postProject = async (req:Request, res:Response) =>{
    const {name, description} = req.body.data
    if (!name || !description) return res.status(400).send('Missing data');
    try {
        await createProject({name,description},req.oidc);
        return res.status(200).send("OK");
    } catch (error) {
        return res.status(406).send("unacceptable")
    }
}

export const removeProject =async (req:Request, res:Response) => {
    const {projectUuid} = req.body;
    if (!projectUuid) return res.status(400).send('Missing data');
    try {
        await deleteProject(projectUuid);
        return res.status(200).send("OK");
    } catch (error) {
        return res.status(406).send("unacceptable")
    }

}

export const patchProject = async (req:Request, res:Response) =>{
    const {projectUuid} = req.body
    const {name, description} = req.body.data
    if (!name || !description) return res.status(400).send('Missing data');
    try {
        await updateProject(projectUuid,{name,description});
        return res.status(200).send("OK");
    } catch (error) {
        return res.status(406).send("unacceptable")
    }
}

export const putOwnerToProject =async (req:Request, res:Response) => {
    const {projectUuid} = req.body
    const {userUuids} = req.body.data
    if (!userUuids) return res.status(400).send('Missing data');
    try {
        if (userUuids.lenght == 1) {
            await addOwnerToProject(userUuids[0], projectUuid)
            return res.status(200).send("OK");
        }
        await addOwnersToProject(projectUuid, userUuids)
        return res.status(200).send("OK");
    } catch (error) {
        return res.status(406).send("unacceptable")
    }
}

export const rmOwnerFromProject =async (req:Request, res:Response) => {
    const {projectId} = req.body
    const {userUuids} = req.body.data
    if (!userUuids) return res.status(400).send('Missing data');
    try {
        if (userUuids.lenght == 1) {
            await removeOwnerFromProject(userUuids[0], projectId)
            return res.status(200).send("OK");
        }
        await removeOwnersFromProject(projectId, userUuids)
        return res.status(200).send("OK");
    } catch (error) {
        return res.status(406).send("unacceptable")
    }
}

export const rmUserFromProject =async (req:Request, res:Response) => {
    const {projectId} = req.body
    const {userUuids} = req.body.data
    if (!userUuids) return res.status(400).send('Missing data');
    try {
        if (userUuids.lenght == 1) {
            await removeUserFromProject(userUuids[0], projectId)
            return res.status(200).send("OK");
        }
        await removeUsersFromProject(projectId, userUuids)
        return res.status(200).send("OK");
    } catch (error) {
        return res.status(406).send("unacceptable")
    }
}

export const searchProject =async (req:Request, res:Response) => {
    const {keyword} = req.body.data;
    if (!keyword) return res.status(400).send('Missing data');
    try {
        const foundProjects = searchForProjectBasedOnKeyword(req.oidc,keyword)
        return res.status(200).send(foundProjects); 
    } catch (error) {
        return res.status(406).send("unacceptable")
    }
}


