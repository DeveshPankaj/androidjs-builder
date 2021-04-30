import {Task} from "../../utils/task";
import createLogger from "../../utils/getlogger";
import path from "path";

const {exec, spawn} = require('child_process');
const logger = createLogger(__filename)

export class SignApk extends Task {
    execute(data: any): void {
        logger.info(`Running <${this.constructor.name}>.execute(data)`)

        const signer:string = data.tools.signer
        const build_folder = data.project.build_path

        let apk_file_path:string = path.join(build_folder, data.name + '.apk')
        let build_working_dir = build_folder

        let args_: Array<string> = ['-jar', signer, '--apks', apk_file_path];

        if(data.release === false) {
            args_.push('--debug');
            logger.info("Generating apk in debug mode. use '--release' to generate release build");
        } else {
            logger.info("Generating apk in release mode.");
        }

        const proc = spawn('java', args_, {cwd: build_working_dir});
        proc.stdout.on('data', (_data: any) => {
            console.log(`${_data}`)
        });
        proc.stderr.on('data', (_data: any) => {
            logger.error(`${_data}`)
        });
        proc.on('close', (code: any) => {
            logger.info(`Exit code: ${code}`)
            if(code === 0) {
                this.next(data)
            }
        })
    }
}
