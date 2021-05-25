import {Command} from "commander"
import Generator, { Params } from "../generators/generator"
import * as inquirer from "inquirer"
import {Context} from "../utils/getcontext"

import createLogger from '../utils/getlogger'
import path from "path"
const logger = createLogger(__filename)
const context  = Context.get()

export default (commandName: string, cmd: Command): void => {

    cmd.alias('i')
    cmd.description('Create new project')
    cmd.option('-t, --type <string>', 'project template')
    cmd.option('--name <string>', 'app name')
    cmd.option("-d, --debug", "activate more debug messages. Can be set by env var DEBUG.", false)
    
    
    const appGenerators: {[key: string]: Generator } = {}
    /// Example: register new Generator
    /// appGenerators.myCustomGeneratorName = new MyCustomGenerator()

    for(let generatorName in context.config['commands.init']) {
        let generatorFile = path.join(context.builder_dir, context.config['commands.init'][generatorName])
        let generator = require(generatorFile).default
        appGenerators[generatorName] = new generator()
    }
    
    
    cmd.addHelpText('after', `
    Examples:
      $ ${context.config.app} ${commandName} --name myapp --type ${Object.keys(appGenerators)[0]}
      $ ${context.config.app} ${commandName}
      
    --type [Options]:
    \t${Object.keys(appGenerators).join('\n\t')}`
    )
    
    
    cmd.action((...args: Array<{[key: string]: string}>) => {
        const [params] = args
    
        for(let key in params) {
            logger?.debug(`Params ${key} = ${params[key]}`)
        }
    
        const callback = (answers: {[key: string]: string}) => {
    
            answers = {...params, ...answers}
    
            if (!appGenerators.hasOwnProperty(answers.type)) {
                return logger?.error(`Project type: ${answers.type}, not supported`)
            }
    
            logger?.debug(`Using ${appGenerators[answers.type].constructor.name}`)
    
            for(let key in answers) {
                logger?.debug(`Inquirer ${key} = ${answers[key]}`)
            }
    
            let generaterConfigPath = `commands.${commandName}.${answers.type}`
            let generatorConfigData = context.config[generaterConfigPath] || {}
            appGenerators[answers.type].generate(answers as unknown as Params, generatorConfigData).catch(error => {
                logger?.error(error)
            })
        }
    
        // Check App Name
        if(!params.name) questions.push({
            type: "input",
            name: "name",
            message: "Application name:"
        })
    
        // Check Project type and reset if defined project type is invalid
        if(params.type && !appGenerators.hasOwnProperty(params.type)) {
            logger?.warn(`Invalid project type '${params.type}' please select a valid project type supported by ${context.config.name}@${context.pkg.version}`)
            delete params.type
        }
    
        if(!params.type) questions.push({
            type: "list",
            name: "type",
            message: "Project type:",
            choices: [...Object.keys(appGenerators)]
        })
    
        if(questions.length > 0) inquirer.prompt(questions).then(callback)
        else callback({})
    })
    
    const questions: Array<any> = [];
    
}
