import Builder from "./builder";
import createLogger from '../utils/getlogger'
import {Init} from "./react/init";
import {BuildProject} from "./react/buildProject";
import {CopyFiles} from "./react/copyFiles";
import {UpdateFiles} from "./react/updateFiles";
import {BuildApk} from "./react/buildApk";
import {SignApk} from "./react/signApk";

const logger = createLogger(__filename)

export default class ReactBuilder implements Builder {
    static type: string = 'react'

    build(params: any): Promise<any> {
        return new Promise((resolve, reject) => {
            logger.debug('Bootstrapping tasks')

            const taskChain = new Init()
                .addNextTask(new BuildProject())
                .addNextTask(new CopyFiles())
                .addNextTask(new UpdateFiles())
                .addNextTask(new BuildApk())
                .addNextTask((new SignApk()).setCallback(() => resolve()))

            try {
                taskChain.execute(params)
            } catch (error) {
                reject(error)
            }
        })
    }
}




