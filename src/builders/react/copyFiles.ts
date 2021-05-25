import {Task} from "../../utils/task";
import createLogger from "../../utils/getlogger";
import * as fse from 'fs-extra';
import * as fs from 'fs';
import path from "path";
import {Context} from "../../utils/getcontext";
const logger = createLogger(__filename)
const context  = Context.get()
export class CopyFiles extends Task {
    execute(data: any): void {
        logger.info('Copying files')

        logger.debug('Copy file required for node app')

        const srcDir = path.join(context.project_dir, 'src', 'backend')// TODO: provide option to change backend directory
        const destDir = path.join(context.project_dir, data.env_object.BUILD_PATH, '..'); 

        if(!fse.existsSync(srcDir)) {
            logger.error(`${srcDir} not found`)
            throw `${srcDir} not found`
        }

        const main_file = path.join(srcDir, 'main.js')
        if(!fse.existsSync(main_file)) {
            logger.error(`${main_file} not found`)
            throw `${main_file} not found`
        }

        try {
            //fse.copySync(srcDir, destDir,{ overwrite: true });

            const ignore_paths: Array<RegExp> = [
                new RegExp('./node_modules/*'),
                new RegExp('./git/*'),
                new RegExp('./build/*')
            ]

            fse.copy(srcDir, destDir, {
                    filter: n => {
                        let relative = n.substring(context.project_dir.length)

                        let ignore = false;
                        for(const regx of ignore_paths) {
                            ignore = regx.test(relative)
                            if(ignore) return false
                        }

                        if (fs.lstatSync(n).isDirectory()) {
                            return true;
                        }
                        return true;
                    }
                },
                (error) => {
                    if(error) throw error
                    this.next(data)
                    console.log('Done!')
                }
            );
        } catch (error) {
            logger.error(`Failed to copy: ${srcDir}, to: ${destDir}`)
            throw error
        }

    }
}
