import {Builder} from "./builder";
import createLogger from '../utils/getlogger'
import {Init} from "./react/init";
import {BuildProject} from "./react/buildProject";
import {CopyFiles} from "./react/copyFiles";
import {UpdateFiles} from "./react/updateFiles";
import {BuildApk} from "./react/buildApk";
import {SignApk} from "./react/signApk";
import { ConfigData, Params } from "../generators/generator";

const logger = createLogger(__filename)

export class ReactBuilder implements Builder {
    build(params: Params, config: ConfigData): Promise<any> {
        return new Promise((resolve, reject) => {
            logger.debug('Bootstrapping tasks')

            const taskChain = new Init()
                .addNextTask(new BuildProject())
                .addNextTask(new CopyFiles())
                .addNextTask(new UpdateFiles())
                .addNextTask(new BuildApk())
                .addNextTask((new SignApk()).setCallback(() => resolve(0)))

            try {
                taskChain.execute({...params, config})
            } catch (error) {
                reject(error)
            }
        })
    }
}




export default ReactBuilder