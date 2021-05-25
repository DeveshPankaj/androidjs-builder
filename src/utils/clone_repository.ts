const Git = require("nodegit")
import createLogger from "../utils/getlogger";
const logger = createLogger(__filename)

export default async  (repo_url: string, folder: string): Promise<boolean> => {
    logger.info(`Downloading ${repo_url} to ${folder}`)

    await Git.Clone(repo_url, folder)

    return true
}
