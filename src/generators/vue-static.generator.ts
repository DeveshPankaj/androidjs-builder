import Generator, { ConfigData, Params } from './generator'
import {Context} from "../utils/getcontext";
import {existsSync, mkdirSync} from "fs";
import path from "path";
import * as fs from 'fs'
import clone_repository from "../utils/clone_repository";
import createLogger from '../utils/getlogger'

const logger = createLogger(__filename)

/**
 * @Generator VueStaticGenerator
 * 
 *```typescript
 * const generator = new VueStaticGenerator()
 * let params = {name: 'MyApp'}
 * let config = {repo: 'https://github.com/deveshpankaj/androidjs-html-app'}
 * generator.generate(params, config)
 * 
 * // $ npm i androidjs-builder -g
 * // $ androidjs init --name Myapp --type html
 * ```
 */
export class VueStaticGenerator implements Generator {
    context: Context
    constructor() {
        this.context = Context.get()
    }

    generate(params: Params, config: ConfigData): Promise<any> {
        return new Promise((resolve, reject) => {
            logger?.info(`Generating app using: ${this.constructor.name}.`)

            if(existsSync(path.join(this.context.project_dir, params.name))) {
                return reject(`directory already exist ${path.join(this.context.project_dir, params.name)}`)
            }

            mkdirSync(path.join(this.context.project_dir, params.name), { recursive: true })
            clone_repository(config.repo, path.join(this.context.project_dir, params.name))
                .then(_ => {
                    fs.rmdirSync(path.join(this.context.project_dir, params.name, '.git'), {recursive: true})
                    return resolve(0)
                }).catch(error => {
                logger?.error(JSON.stringify({error}))
            })
        })
    }
}

export default VueStaticGenerator