import {Builder} from "./builder";
import createLogger from '../utils/getlogger'
import {Init} from "./react/init";
import {BuildProject} from "./react/buildProject";
import {CopyFiles} from "./react/copyFiles";
import {UpdateFiles} from "./react/updateFiles";
import {BuildApk} from "./react/buildApk";
import {SignApk} from "./react/signApk";
import { ConfigData, Params } from "../generators/generator";
import { spawn, exec } from "child_process";
import path from "path";
import { Task } from "../utils/task";
import {series} from 'async';
import { Context } from "../utils/getcontext";
const logger = createLogger(__filename)

export class ReactNativeBuilder implements Builder {
    build(params: Params, config: ConfigData): Promise<any> {
        return new Promise((resolve, reject) => {
            logger.debug('Bootstrapping tasks')

            const taskChain = new Init()
                .addNextTask(new ClearCache())
                .addNextTask((new RunServe()).setCallback(() => resolve(0)))

            try {
                taskChain.execute({...params, config})
            } catch (error) {
                reject(error)
            }
        })
    }
}

export class ClearCache extends Task {
    execute(data: any): void {
        logger.info(`Running <${this.constructor.name}>.execute(data)`)
        this.next(data)
    }
}

// TODO:
export class RunServe extends Task {
    execute(data: any): void {
        logger.info(`Running <${this.constructor.name}>.execute(data)`)

        const _cwd = path.join(Context.get().project_dir, 'android')

        // const serve = spawn('ls', ['.'], )
        // serve.stdout.pipe(process.stdout)
        // serve.on('exit', (code) => {
        //     this.next(data)
        // })
        

        // this.next(data)
        
    }
}



export default ReactNativeBuilder