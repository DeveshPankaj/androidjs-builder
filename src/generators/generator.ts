
export type Params = {
    name: string
    type: string
    debug?: boolean
    release?: boolean
    force?: boolean
}

export type ConfigData = {
    sdk: string
    repo: string
    tools: {
        apktool: string
        signer: string
    }
}

export interface Generator {
    generate(params: Params, configData: ConfigData): Promise<any>
}

export default Generator