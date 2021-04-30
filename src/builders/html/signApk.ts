import {Task} from "../../utils/task";
import createLogger from "../../utils/getlogger";
const logger = createLogger(__filename)

export class SignApk extends Task {
    execute(data: any): void {
        logger.info('Sign Apk')

        this.next(data)
    }
}
