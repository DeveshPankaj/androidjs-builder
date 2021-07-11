import {createLogger, format, transports} from "winston";
import path from "path";

export default (name: string) => {
    name = path.parse(name).name

    let isDebugEnable = process.argv.includes('--debug') || process.argv.includes('-d')

    if(isDebugEnable) {
        return createLogger({
            level:  'debug',
            format: format.combine(
                format.timestamp(),
                format.printf(i => `${i.timestamp} | ${i.level.toUpperCase().padEnd(7, ' ')} | ${name} | ${i.message}${i.more? ' | ' + JSON.stringify(i.more) : ''}`)
            ),
            transports: [ new transports.Console({}) ]
        })
    } else {
        return createLogger({
            format: format.combine(
                format.timestamp(),
                format.printf(i => `${i.level.toUpperCase().padEnd(7, ' ')} | ${i.message}`)
            ),
            transports: [ new transports.Console({}) ]
        })
    }
}
