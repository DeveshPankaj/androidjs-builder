
import createLogger from "../utils/getlogger";

const logger = createLogger(__filename)

export abstract class Task {
    nextTask: Task | null = null
    callback: ((data: any) => any) | undefined

    abstract execute(data: any): void
    addNextTask(nextTask: Task) {
        let ptr:Task = this
        while (ptr.nextTask) {
            ptr = ptr.nextTask
        }
        ptr.nextTask = nextTask
        logger?.debug(`Added ${nextTask.constructor.name} Task`)
        return this
    }

    next(data:any) {
        try {
            if(this.nextTask) this.nextTask.execute(data)
            else if(this.callback) this.callback(data)
        } catch(error) {
            logger?.error(`Failed to complete task: ${this.nextTask?.constructor.name || this.callback?.constructor.name}`)
            throw error
        }
        
    }

    setCallback(callback: (data:any) => any) {
        this.callback = callback
        return this
    }
}
