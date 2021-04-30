import Generator from './generator'
import {Context} from "../utils/getcontext";
import {existsSync, mkdirSync} from "fs";
import path from "path";
import * as fs from 'fs'
import clone_repository from "../utils/clone_repository";
import createLogger from '../utils/getlogger'

const logger = createLogger(__filename)

export default class HtmlGenerator implements Generator {
    static type: string = 'html'
    context: Context
    constructor() {
        this.context = Context.get()
    }

    generate(params: any): Promise<any> {
        return new Promise((resolve, reject) => {
            logger?.info(`Generating app using: ${this.constructor.name}.`)

            if(existsSync(path.join(this.context.project_dir, params.name))) {
                return reject(`directory already exist ${path.join(this.context.project_dir, params.name)}`)
            }

            mkdirSync(path.join(this.context.project_dir, params.name), { recursive: true })
            clone_repository(this.context.config.builder.html.repo, path.join(this.context.project_dir, params.name))
                .then(_ => {
                    fs.rmdirSync(path.join(this.context.project_dir, params.name, '.git'), {recursive: true})
                    return resolve()
                }).catch(error => {
                logger?.error(JSON.stringify({error}))
            })
        })
    }
}

