const Git = require("nodegit")

export default async  (repo_url: string, folder: string): Promise<boolean> => {
    console.log(`Downloading ${repo_url} to ${folder}`)

    await Git.Clone(repo_url, folder)

    return true
}
