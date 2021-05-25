import {Task} from "../../utils/task";
import createLogger from "../../utils/getlogger";

const logger = createLogger(__filename)
export class BuildProject extends Task {
    execute(data: any): void {
        logger.debug('Build project not required for html app.')
        this.next(data)
    }
}
