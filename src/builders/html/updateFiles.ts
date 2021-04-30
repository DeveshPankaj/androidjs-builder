import {Task} from "../../utils/task";
import createLogger from "../../utils/getlogger";

const logger = createLogger(__filename)

export class UpdateFiles extends Task {
    execute(data: any): void {
        logger.info('Updating files')

        this.next(data)
    }
}
