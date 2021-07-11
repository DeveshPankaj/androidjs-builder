const Git = require("nodegit")
import path from "path";
import createLogger from "../utils/getlogger";
import {Context} from './getcontext'
import { LoadingBar } from "./loading_animation";
const logger = createLogger(__filename)

const context = Context.get()

export default async  (repo_url: string, folder: string): Promise<boolean> => {
    logger.info(`Downloading ${repo_url} to ${folder}`)

    let load = new LoadingBar(400)
    load.setConfig({
        left: path.parse(folder).name.toUpperCase(),
        right: path.parse(repo_url).name.toUpperCase(),
        length: 50,
        
    })

    try {
        load.start()
        await Git.Clone(repo_url, folder)
    } catch (error) {
        load.stop()
        throw error

    } finally {
        load.stop()
    }
    
    return true
}
