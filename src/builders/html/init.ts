import {Task} from "../../utils/task";
import createLogger from "../../utils/getlogger";
const logger = createLogger(__filename)

export class Init extends Task {
    execute(data: any): void {
        logger.info('Collecting required information')
        logger.info('Checking required tools')

        this.next(data)
    }
}
