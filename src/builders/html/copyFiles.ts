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

        const srcDir = path.join(context.project_dir)
        const destDir = path.join(context.project_dir, data.env_object.BUILD_PATH, '..'); 

        if(!fse.existsSync(srcDir)) {
            logger.error(`${srcDir} not found`)
            throw `${srcDir} not found`
        }

        // TODO: clear old data
        if(!fse.existsSync(destDir)) {
            fse.mkdirSync(destDir,  { recursive: true })
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
                new RegExp('./.git/*'),
            ]

            // Add ignore from .env file
            let ignore_path_list = (data.env_object.IGNORE as string|| "").split(',')
            ignore_path_list.forEach(x => ignore_paths.push(new RegExp(x)))

            let copy_to = path.join(context.project_dir, data.env_object.BUILD_PATH)

            const ls = fse.readdirSync(srcDir, {withFileTypes: true})
            for(let file of ls) {
                let file_path = path.join(srcDir, file.name)

                if(file.isFile()) {
                    fse.copyFileSync(path.join(srcDir, file.name), path.join(destDir, file.name))

                    // copy all directory ignoring build folder
                    // TODO: build folder need to be configurable
                    
                } else if(file.isDirectory() && !copy_to.startsWith(file_path)) {
                    if(!fse.existsSync(path.join(srcDir, file.name))) fse.mkdirSync(path.join(srcDir, file.name))
                    
                    fse.copySync(path.join(srcDir, file.name), path.join(destDir, file.name), {
                            overwrite: true,
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
                        }
                    );
                }
            }
            
            logger?.info("Copied!")
            this.next(data)

        } catch (error) {
            logger.error(`Failed to copy: ${srcDir}, to: ${destDir}`)
            throw error
        }

    }
}
