import {Task} from "../../utils/task";
import createLogger from "../../utils/getlogger";
import * as fse from 'fs-extra';
import * as fs from 'fs';
import path from "path";
import {Context} from "../../utils/getcontext";
const logger = createLogger(__filename)
const context  = Context.get()

export class CopyFiles extends Task {
    execute(data: any): void {
        logger.debug('Copy file not required for vue-static app')
        this.next(data)
    }
}
