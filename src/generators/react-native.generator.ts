import {Context} from '../utils/getcontext'
import Generator, { ConfigData, Params } from './generator'
import clone_repository from "../utils/clone_repository";
import {mkdirSync, existsSync} from 'fs'
import * as path from 'path'
import fs from "fs";

import createLogger from '../utils/getlogger'
const logger = createLogger(__filename)

/**
 * @Generator ReactGenerator
 * 
 *```typescript
 * const generator = new ReactGenerator()
 * let params = {name: 'MyApp'}
 * let config = {repo: 'https://github.com/deveshpankaj/androidjs-react-app'}
 * generator.generate(params, config)
 * 
 * // $ npm i androidjs-builder -g
 * // $ androidjs init --name Myapp --type react
 * ```
 */
export class ReactNativeGenerator implements Generator {
    context: Context
    constructor() {
        this.context = Context.get()
    }

    generate(params: Params, config: ConfigData): Promise<any> {
        return new Promise((resolve, reject) => {
            logger?.info(`Generating app using: ${this.constructor.name}.`)
            logger?.info(`Config: ${JSON.stringify(config)}`)

            if(existsSync(path.join(this.context.project_dir, params.name))) {
                return reject(`directory already exist ${path.join(this.context.project_dir, params.name)}`)
            }

            mkdirSync(path.join(this.context.project_dir, params.name), { recursive: true })
            clone_repository(config.repo, path.join(this.context.project_dir, params.name)).then(_ => {
                fs.rmdirSync(path.join(this.context.project_dir, params.name, '.git'), {recursive: true})
                fs.rmdirSync(path.join(this.context.project_dir, params.name, 'scripts'), {recursive: true})

                const _cwd = process.cwd()
                try {

                    process.chdir(path.join(this.context.project_dir, params.name))
                    require('fs').symlink('./android/app/src/main/assets/scripts', './scripts',"junction", (error:any)=>{if(error)logger?.error(JSON.stringify({error}))})

                } catch (error) {
                    logger?.error(`Failed to create ./scripts link filder: try running command given below.`)
                    logger?.error(`$ node -e "require('fs').symlink('./android/app/src/main/assets/scripts', './scripts',"junction", console.log)"`)
                    logger?.error(JSON.stringify({error}))

                } finally {
                    process.chdir(_cwd)
                }

                return resolve(0)
            }).catch(error => {
                logger?.error(JSON.stringify({error}))
            })
        })
    }
}

export default ReactNativeGenerator 
// cd android && ./gradlew clean && cd .. && node node_modules/react-native/local-cli/cli.js start