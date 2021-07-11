import {Task} from "../../utils/task";
import createLogger from "../../utils/getlogger";
import * as fs from 'fs'
import * as path from 'path'
import {Context} from "../../utils/getcontext";
import clone_repository from "../../utils/clone_repository";
const logger = createLogger(__filename)


const context  = Context.get()

export class Init extends Task {
    execute(data: any): void {
        logger.debug('Collecting required information')

        /// Checking tools required to build
        logger.debug('Checking required tools')
        let tools = {...data.config.tools} as {[key: string]: string}
        for(const [tool_name, tool_path] of Object.entries(tools)) {
            logger.debug(`Checking ${tool_name}`)

            let tool: string
            try {
                tool = path.join(context.builder_dir, tool_path)
            } catch (error) {
                logger.error(`Failed to parse ${tool_path}`)
                throw error
            }

            if(fs.existsSync(tool)) {
                logger.info(`Using ${tool}`)
                tools[tool_name] = tool
            } else {
                logger.error(`Failed to load ${tool}`)
                throw `Failed to load ${tool}`
            }
        }


        // Check .env file
        let env_file = path.join(context.project_dir, '.env')
        let env: Array<string> = ['BUILD_PATH=./build/.androidjs/assets/myapp/views']
        if(!fs.existsSync(env_file)) {
            logger.error(`.env file not found in ${context.project_dir}`)
        } else {
            const env_file_data = fs.readFileSync(env_file)
            env = (env_file_data.toString() || " ").split('\r\n')
        }
        
        const env_object: {[key: string]: string} = {...process.env as {}}

        // load .env
        for(let e of env) {
            if(e[0] === '#' || e[0] === '\r') continue
            let i = e.indexOf('=')
            let key = e.substring(0, i)
            if(key)env_object[key] = e.substring(i + 1)
        }

        const project = {
            build_path: ''
        }

        // Check BUILD_PATH in .env
        if(!env_object.BUILD_PATH) {
            logger.error(`BUILD_PATH not set in .env`)
            logger.info(`set BUILD_PATH=./build/.androidjs/assets/myapp/views`)
            throw `BUILD_PATH not set in .env`
        }

        // Generate project paths wrt. BUILD_PATH
        const BUILD_PATH = env_object.BUILD_PATH
        const split_index = BUILD_PATH.indexOf('.androidjs')
        project.build_path = path.join(context.project_dir,BUILD_PATH.substring(0, split_index))


        // create build folder
        if(!fs.existsSync(project.build_path)) {
            logger.info(`Creating build directory: ${project.build_path}`)
            fs.mkdirSync(project.build_path)
        }

        // Assign data
        Object.assign(data, {tools})
        Object.assign(data, {project})
        Object.assign(data, {_env: env})
        Object.assign(data, {env_object})


        if(!process.env.JAVA_HOME) {
            logger?.error(`Can not find JAVA_HOME in environment variables`)
            throw JSON.stringify({error: 'Can not find JAVA_HOME in environment variables'})
        }

        /// Set JAVA_HOME that can be used by next commands
        data.JAVA_HOME = process.env.JAVA_HOME
        logger.info(`Using JAVA_HOME: ${data.JAVA_HOME}`)

        this.download_sdk(data, () => this.next(data))
    }

    private download_sdk(data: any, callback: any) {
        // TODO: call project/package.json:[androidjs:prebuild]
        // TODO: download sdk, as per the configuration (static/with node)
        let sdkFolder = path.join(data.project.build_path, '.androidjs')

        // delete sdk for force build
        if(fs.existsSync(sdkFolder) && data.force) {
            logger.info('Removing cache files')
            fs.rmdirSync(sdkFolder,{recursive: true})
        }

        if(fs.existsSync(sdkFolder)) {
            logger.info('.androidjs exist')
            callback(data)
        } else {
            logger.info('.androidjs not found')
            clone_repository(data.config.sdk, sdkFolder).then(_ => {
                fs.rmdirSync(path.join(sdkFolder, '.git'), {recursive: true, retryDelay: 500, maxRetries: 2})
                callback(data)
            })
        }
    }
}
