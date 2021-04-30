import {Command} from "commander"
import Builder from "../builders/builder";
import {Context} from "../utils/getcontext";
import createLogger from '../utils/getlogger'
import * as fs from "fs";
import path from "path";
const logger = createLogger(__filename)

const context  = Context.get()
const cmd = new Command('build').alias('b')

cmd.description('Build project')

const builders: {[key: string]: Builder} = {}

for(let builderFile of context.config.include.build) {
    let builder = require(builderFile).default
    if(!builder.type) {
        logger?.error(`Failed to load ${builderFile} ${builder.name}, can not find static member 'type' defined in object/class`)
        continue
    }
    builders[builder.type] = new builder()
}

cmd.addHelpText('after', `
Example:
    $ ${context.config.app} build --debug
    $ ${context.config.app} build
Supported Projects types:
\t${Object.keys(builders).join('\n\t')}`)

cmd.option("-d, --debug", "activate more debug messages. Can be set by env var DEBUG.", false)
cmd.option("-r, --release", "Create a release build", false)
cmd.option("-f, --force", "Remove cache data and rebuild", false)

cmd.action((...args: Array<{[key: string]: string}>) => {
    const [params] = args

    for(let key in params) {
        logger?.debug(`Params ${key} = ${params[key]}`)
    }

    logger?.debug(`Project directory ${context.project_dir}`)

    let pkgPath = path.join(context.project_dir, 'package.json')

    if(!fs.existsSync(pkgPath)) {
        logger?.error(`Can not find ${pkgPath}`)
        return
    }

    let pkg = require(pkgPath)

    let obj: {[key: string]: string} = {
        ...params,
        name: pkg.name,
        type: pkg.type || pkg['project-type']
    }

    if(!obj.type) {
        logger?.error(`Project type not defined in package.json. ${pkgPath}`)
        return
    }

    if(!builders.hasOwnProperty(obj.type)) {
        logger?.error(`Project type [${obj.type}] not supported by ${context.config.app}.`)
        return
    }



    let builder = builders[obj.type];

    logger?.debug(`Using ${builder.constructor.name}`)
    for(let key in obj) {
        logger?.debug(`Params ${key} = ${obj[key]}`)
    }

    builder.build(obj).catch(error => {
        logger?.error(error)
    })
})

export default cmd
