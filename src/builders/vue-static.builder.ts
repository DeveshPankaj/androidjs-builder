import {Builder} from "./builder";
import createLogger from '../utils/getlogger'
import {Init} from "./html/init";
import {BuildProject} from "./vue-static/buildProject";
import {CopyFiles} from "./vue-static/copyFiles";
import {UpdateFiles} from "./vue-static/updateFiles";
import {BuildApk} from "./html/buildApk";
import {SignApk} from "./html/signApk";
import { ConfigData, Params } from "../generators/generator";

const logger = createLogger(__filename)

export class VueStaticBuilder implements Builder {
    build(params: Params, config: ConfigData): Promise<any> {
        return new Promise((resolve, reject) => {

            logger.info('Creating chain')
            const taskChain = new Init()
            taskChain.addNextTask(new BuildProject())
            taskChain.addNextTask(new CopyFiles())
            taskChain.addNextTask(new UpdateFiles())
            taskChain.addNextTask(new BuildApk())
            taskChain.addNextTask((new SignApk()).setCallback(() => resolve(0)))

            taskChain.execute({...params, config})

        })
    }
}

export default VueStaticBuilder