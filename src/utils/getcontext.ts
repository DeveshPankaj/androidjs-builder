import {Logger,createLogger, format, transports} from "winston";
import path from "path"
const req = require('require-yml')

export class Context {
    private static instance: Context
    public project_dir: string
    public builder_dir: string
    public config = req(path.join(__dirname, '..', '..' ,'config.yaml'))
    public pkg = require('../../package.json')
    private constructor() {
        this.project_dir = process.cwd()
        this.builder_dir = path.join(__dirname, '..', '..')
    }
    static get(): Context {
        if(!Context.instance) Context.instance = new Context()
        return Context.instance
    }
}

