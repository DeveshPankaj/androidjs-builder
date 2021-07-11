import { ConfigData, Params } from "../generators/generator";

export interface Builder {
    build(params: Params, configData: ConfigData): Promise<any>
}

export default Builder
