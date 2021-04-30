import Builder from "./builder";
import createLogger from '../utils/getlogger'
import {Init} from "./html/init";
import {BuildProject} from "./html/buildProject";
import {CopyFiles} from "./html/copyFiles";
import {UpdateFiles} from "./html/updateFiles";
import {BuildApk} from "./html/buildApk";
import {SignApk} from "./html/signApk";

const logger = createLogger(__filename)

export default class HtmlBuilder implements Builder {
    static type: string = 'html'

    build(params: any): Promise<any> {
        return new Promise((resolve, reject) => {


            logger.info('Creating chain')

            const taskChain = new Init()
            taskChain.addNextTask(new BuildProject())
            taskChain.addNextTask(new CopyFiles())
            taskChain.addNextTask(new UpdateFiles())
            taskChain.addNextTask(new BuildApk())
            taskChain.addNextTask(new SignApk())
            taskChain.execute(params)

        })
    }
}
