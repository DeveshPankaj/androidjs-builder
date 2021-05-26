import {Task} from "../../utils/task";
import clone_repository from "../../utils/clone_repository";
import * as path from 'path'
import * as fs from 'fs'
const {exec} = require('child_process');

import createLogger from "../../utils/getlogger";
import {Context} from "../../utils/getcontext";
const context  = Context.get()

const logger = createLogger(__filename)
export class BuildProject extends Task {

    execute(data: any): void {

        logger.info(`Running \`npm run build\``)

        exec('npm run build', {cwd: process.cwd()}, (error: any | null, stdout: string, stderr: string) => {
            if (error) {
                logger.error(`exec error: ${error}`)
                return;
            }
            logger.info(`${stdout}`)

            this.next(data)
        });
    }
}

