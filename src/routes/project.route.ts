import express  from "express";
import { requiresAuth } from "express-openid-connect";
import {getAllProjects,searchProject ,patchProject, postProject, putOwnerToProject, removeProject, rmOwnerFromProject, rmUserFromProject} from "../controllers/project.controller"
import {isTeacherOrAdmin } from "../middlewares/hasRole.middleware";

const projectRouter = express.Router();


projectRouter.get("/all", getAllProjects);
projectRouter.post("/create" ,postProject);
projectRouter.delete("/delete/:projectUuid", isTeacherOrAdmin , removeProject);
projectRouter.put("/update/:projectUuid", isTeacherOrAdmin , patchProject);
projectRouter.patch("/owner/add/:projectUuid", isTeacherOrAdmin , putOwnerToProject);
projectRouter.patch("/owner/remove/:projectUuid", isTeacherOrAdmin , rmOwnerFromProject);
projectRouter.patch("/user/remove/:projectUuid", isTeacherOrAdmin , rmUserFromProject);
projectRouter.post("/search", searchProject)

export default projectRouter;