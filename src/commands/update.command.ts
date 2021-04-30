import {Command} from "commander"

const cmd = new Command('update').alias('u')

cmd.description('Update builder')

export default cmd
