import {Command} from "commander"

export default (commandName: string, cmd: Command) => {
    cmd.alias('u').description('Update builder')
}
