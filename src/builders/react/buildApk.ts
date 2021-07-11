import {Task} from "../../utils/task";
import clone_repository from "../../utils/clone_repository";
import * as path from 'path'
import * as fs from 'fs'
const {exec, spawn} = require('child_process');

import createLogger from "../../utils/getlogger";
import {Context} from "../../utils/getcontext";
const context  = Context.get()


const logger = createLogger(__filename)

export class BuildApk extends Task {
    preBuild(data: any) {
        /// TODO: call project/package.json:[androidjs:prebuild]
        this._execute(data)
    }

    postBuild(data: any) {
        /// TODO: call project/package.json:[androidjs:postbuild]
        this.next(data)
    }

    execute(data: any): void {
        this.preBuild(data)
    }

    private _execute(data: any) {
        logger.info(`Running <${this.constructor.name}>.execute(data)`)

        const apktool:string = data.tools.apktool
        const build_folder = data.project.build_path
        const sdk_path:string = path.join(data.project.build_path, '.androidjs')

        // exec('npm run build', {cwd: process.cwd()}, (error: any | null, stdout: string, stderr: string) => {
        //     if (error) {
        //         logger.error(`exec error: ${error}`)
        //         return;
        //     }
        //     logger.info(`${stdout}`)
        //
        //     this.postBuild(data)
        // });

        const cacheFolderPath = build_folder
        const buildApkFilePath = path.join(build_folder, data.name + '.apk');

        let args_ = ['-jar', apktool, 'b', sdk_path, '-o', buildApkFilePath, '--frame-path', cacheFolderPath];
        const proc = spawn('java', args_, {cwd: cacheFolderPath});

        proc.stdout.on('data', (_data: any) => {
            console.log(`${_data}`)
        });
        proc.stderr.on('data', (_data: any) => {
            console.log(`${_data}`)
        });
        proc.on('close', (code: any) => {
            console.log(`Exit code: ${code}`)

            if(code === 0) {
                this.postBuild(data)
            }

            if(code === 1) {
                /// TODO: auto detect this error
                console.log('Please remove build folder if getting this error [brut.directory.PathNotExist: apktool.yml]')
            }
        });
    }
}
