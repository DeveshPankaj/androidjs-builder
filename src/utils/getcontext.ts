import {Logger,createLogger, format, transports} from "winston";
import path from "path"
import fs from 'fs'
import {homedir as getHomeDir} from 'os'
import YAML from 'yaml'

const var_regex = /\${([^}]+)}/g
const homedir: string = process.env.HOME || process.env.USERPROFILE || process.env.HOMEPATH || getHomeDir()


export class Context {
    private static instance: Context
    public project_dir: string
    public builder_dir: string
    public home_dir: string
    public config: {[key: string]: any} = {}
    public pkg = require('../../package.json')
    private constructor() {
        this.project_dir = process.cwd()
        this.home_dir = homedir
        this.builder_dir = path.join(__dirname, '..', '..')
        const yaml_data = fs.readFileSync(path.join(this.builder_dir, 'config.yaml')).toString()

        const yaml_raw_parsed = YAML.parse(yaml_data)

        const varMap: {[key: string]: string } = {
            BUILDER_DIR: this.builder_dir,
            BUILDER_DIST_NAME: path.parse(path.join(__dirname, '..')).name,
            BUILDER_CACHE_DIR: path.join(this.home_dir, `.${yaml_raw_parsed.app}`),
        
            PROJECT_DIR: this.project_dir,
            // PROJECT_CACHE_DIR: path.join(process.cwd(), 'dist', '.androidjs'), /// Project Cache must be handeld by builder
        }

        function replacer(match: string): string {
            let v = match.substring(2, match.length-1)
            return varMap[v] || match
        }

        
        const yaml_data_vars = yaml_data.replace(var_regex, replacer)
        const parsed = YAML.parse(yaml_data_vars)

        this.config = parsed
    }
    static get(): Context {
        if(!Context.instance) Context.instance = new Context()
        return Context.instance
    }

    public getProjectCacheDir(): string {
        return ""
    }
}

