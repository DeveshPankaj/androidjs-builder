#!/usr/bin/env node
import {Command} from 'commander'
import {Context} from "./utils/getcontext"

const context = Context.get()
const program = new Command()


// init program
program
    .version(context.pkg.version, '-v, --version', 'output the current version')
    .usage("[options]")

// loading commands
for(let key in context.config.commander as { [key:string] :string }) {
    program.addCommand(require(context.config.commander[key]).default)
}

program.parse(process.argv)


