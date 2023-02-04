import * as jdenticon from "jdenticon"
import * as fs from "fs"

export const generateIdentiIcon = async (hash: string) => {
    try {
        await fs.promises.readFile(`${process.env.IDENTICON_FOLDER}/${hash}.svg`)
        return "";
    } catch (error) {
        const svg = jdenticon.toSvg(hash, 200)
        fs.writeFile(`${process.env.IDENTICON_FOLDER}/${hash}.svg`, svg, (err) => console.log(err))
        return `${process.env.SERVER_ADDRES}identicons/${hash}.svg`;
    }
}