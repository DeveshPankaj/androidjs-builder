import {Task} from "../../utils/task";
import createLogger from "../../utils/getlogger";
import * as fs from 'fs'
import * as path from 'path'
import {Context} from "../../utils/getcontext";

const logger = createLogger(__filename)

const context  = Context.get()

export class Init extends Task {
    execute(data: any): void {
        logger.debug('Collecting required information')

        const project = {
            build_path: ''
        }
        const env_object: {[key: string]: string} = {...process.env as {}}

        
        // Check .env file
        let env_file = path.join(context.project_dir, '.env')
        if(!fs.existsSync(env_file)) {
            logger.warn(`.env file not found in ${context.project_dir}`)
        } else {
            const env_file_data = fs.readFileSync(env_file)
            const env = (env_file_data.toString() || " ").split('\r\n')
    
            // load .env
            for(let e of env) {
                if(e[0] === '#' || e[0] === '\r') continue
                let i = e.indexOf('=')
                let key = e.substring(0, i)
                if(key)env_object[key] = e.substring(i + 1)
            }
        }

        // Assign data
        Object.assign(data, {project})
        Object.assign(data, {env_object})

        /// Set JAVA_HOME that can be used by next commands
        data.JAVA_HOME = process.env.JAVA_HOME
        logger.info(`Using JAVA_HOME: ${data.JAVA_HOME}`)

        this.next(data)
    }
}
