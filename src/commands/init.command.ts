import {Command} from "commander"
import Generator from "../generators/generator"
import * as inquirer from "inquirer"
import {Context} from "../utils/getcontext"

import createLogger from '../utils/getlogger'
const logger = createLogger(__filename)

const context  = Context.get()
const cmd = new Command('init').alias('i')
cmd.description('Create new project')
cmd.option('-t, --type <string>', 'project template')
cmd.option('--name <string>', 'app name')
cmd.option("-d, --debug", "activate more debug messages. Can be set by env var DEBUG.", false)


const appGenerators: {[key: string]: Generator } = {}
/// Example: register new Generator
/// appGenerators.myCustomGeneratorName = new MyCustomGenerator()

for(let generatorFile of context.config.include.init) {
    let generator = require(generatorFile).default
    if(!generator.type) {
        logger?.error(`Failed to load ${generatorFile} ${generator.name}, can not find static member 'type' defined in object/class`)
        continue
    }
    appGenerators[generator.type] = new generator()
}


cmd.addHelpText('after', `
Examples:
  $ androidjs init --name myapp --type ${Object.keys(appGenerators)[0]}
  $ androidjs init
  
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

        appGenerators[answers.type].generate(answers).catch(error => {
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

export default cmd
