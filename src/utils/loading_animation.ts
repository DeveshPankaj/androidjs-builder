
export class Loading {
    private states = ["\\", "|", "/", "-"]
    private isRunning = false
    private interval: number = 1000
    private loop: NodeJS.Timeout | null = null
    private currentState: number = 0
    private _isRunning = false
    private isTTY = process.stdout.isTTY

    start() {

        if(!this.isTTY) {
            process.stdout.write('Loading...')
            return
        }

        this.isRunning = true
        this.loop = setInterval(() => {
            if(this._isRunning) {
                process.stdout.clearLine?.(0)
                process.stdout.cursorTo?.(0)
            }
            process.stdout.write(this.states[this.currentState])
            this.currentState = (this.currentState + 1) % this.states.length
            this._isRunning = true

        }, this.interval)
    }

    stop() {
        if(this.isRunning && this.loop !== null) {
            this.isRunning = false
            this._isRunning = false
            clearInterval(this.loop)
        }
    }
}

export class Progress {
    private config = {
        left: ' ',
        right: '|',
        empty: ' ',
        fill: '▉'
    }
    private isRunning = false
    private length: number = 50
    private isTTY = process.stdout.isTTY
    private _lastFill = 0

    start() {
        
        if(!this.isTTY) {
            process.stdout.write('Loading...')
            return
        }

        this.isRunning = true
        process.stdout.write('\n')
    }

    next(nextTick: number, msg: string='') {
        if(!this.isTTY || !this.isRunning) {
            return
        }

        let fill = Math.floor((this.length*nextTick) / 100)

        if(this._lastFill === fill) return

        process.stdout.clearLine?.(0)
        process.stdout.cursorTo?.(0)

        this._next(fill, msg || `${nextTick}%`)
    }

    private _next(fill: number, msg: string='') {
        process.stdout.write(`${msg}${this.config.left}${this.config.fill.repeat(fill)}${this.config.empty.repeat(this.length-fill)}${this.config.right}`)
    }

    stop() {
        this.isRunning = false
    }
}


export class LoadingBar {
    private config = {fill: '<   ', empty: ' ', left: '', right: '', leftToRight: false, length: 50}
    private loop: NodeJS.Timeout | null = null
    private currentState: number = 0
    private _isRunning = false
    private isTTY = process.stdout.isTTY
    private _pattern: string = this.config.fill.repeat(Math.ceil(this.config.length/this.config.fill.length)+1)

    constructor(private interval: number = 700) {}
    start() {
        if(!this.isTTY) {
            process.stdout.write('Loading...')
            return
        }
        this._next()
        this.loop = setInterval(this._next, this.interval)
    }

    setConfig(config: {fill?: string, empty?: string, left?: string, right?: string, leftToRight?: boolean, length?: number}) {
        Object.assign(this.config, config)
        this._pattern = this.config.fill.repeat(Math.ceil(this.config.length/this.config.fill.length)+1)
    }

    private _next = () => {
        if(this._isRunning) {
            // process.stdout.clearLine?.(0)
            process.stdout.cursorTo?.(0)
        }
        this._isRunning = true
        let index = this.currentState
        if(this.config.leftToRight) index = this.config.fill.length - index
        process.stdout.write(`${this.config.left || '|'}${this._pattern.substr(index, this.config.length)}${this.config.right || '|'}`)
        this.currentState = (this.currentState+1) % this.config.fill.length
    }

    stop() {
        if(this.loop !== null) {
            this._isRunning = false
            clearInterval(this.loop)
            process.stdout.clearLine?.(0)
            process.stdout.cursorTo?.(0)
        }
    }
}
