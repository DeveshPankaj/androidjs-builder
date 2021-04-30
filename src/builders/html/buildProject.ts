import {Task} from "../../utils/task";
import createLogger from "../../utils/getlogger";

const logger = createLogger(__filename)
export class BuildProject extends Task {
    execute(data: any): void {
        logger.info('Build project')

        this.next(data)
    }
}
