import { randomBytes } from "crypto";
import { RequestContext } from "express-openid-connect";
import { db } from "../utils/db.utils";
import { generateIdentiIcon } from "./icon.service";


export const createUserIfNotExist = async (oidc: RequestContext) => {
    const {user} = oidc;
    
    if (!user) {
        return;
    }

   await db.user.upsert({
        where:{
            email: user.email
        },
        update: {
            lastLogin: new Date().toISOString()
        },
        create:{
            email: user.email,
            name: user.name,
            nickname: user.nickname,
            sub: user.sub,
            picture: await generateIdentiIcon(randomBytes(20).toString('hex')).then(),
        }
    }).then(async () => {
        await db.$disconnect()
      })
      .catch(async (e) => {
        console.error(e)
        await db.$disconnect()
      })
    return;
}

export const findUser = async (oidc: RequestContext) => {
    const {user} = oidc;
    if (!user) {
        throw new Error("Invalid login information");
    }

    const foundUser = await db.user.findUnique({
        where:{
            email: user.email
        }
    }) 

    if (!foundUser) {
        throw new Error("user does not exist"); 
    }

    const {email,name,nickname, picture, lastLogin, role} = foundUser;

    const result: userData = {
        email,
        name,
        nickname, 
        picture: picture? picture: "", 
        lastLogin, 
        role
    }

    return result;

}