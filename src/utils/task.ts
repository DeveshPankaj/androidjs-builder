
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
        return this
    }

    next(data:any) {
        if(this.nextTask) this.nextTask.execute(data)
        else if(this.callback) this.callback(data)
    }

    setCallback(callback: (data:any) => any) {
        this.callback = callback
        return this
    }
}
