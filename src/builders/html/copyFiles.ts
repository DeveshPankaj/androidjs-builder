import {Task} from "../../utils/task";
import createLogger from "../../utils/getlogger";
const logger = createLogger(__filename)

export class CopyFiles extends Task {
    execute(data: any): void {
        logger.info('Copying files')

        this.next(data)
    }
}
