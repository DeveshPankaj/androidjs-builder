#!/usr/bin/env node
import {Command} from 'commander'
import path from 'path'
import {Context} from "./utils/getcontext"

const context = Context.get()
const program = new Command()


// init program
program
    .version(context.pkg.version, '-v, --version', 'output the current version')
    .usage("[options]")

function loadCommands(program: Command): void {
    let builder_root = context.builder_dir

    for(let key in context.config.commands) {
        let new_command_path = path.join(builder_root, context.config.commands[key])
        let new_command_name = key
        let cmd = new Command(new_command_name)
        require(new_command_path).default(new_command_name, cmd)
        program.addCommand(cmd)
    }
}

loadCommands(program as Command)

program.parse(process.argv)


