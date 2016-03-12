import fs from "fs"
import path from "path"
import memoize from "lodash.memoize"

export default function ComponentFetcher ({componentsFolders: paths}) {
  let readdir = memoize(fs.readdirSync)
  
  let componentsInFolder = memoize(function (folder) {
    let files = readdir(folder)
      .map(file => [path.basename(file, path.extname(file)), path.resolve(folder, file)])
      .reduce(((acc, [name, path]) => {
        acc[name] = path
        return acc
      }), {})
    return files
  })
  
  return memoize(function fetchComponent(name) {
    for (let i = 0, len = paths.length; i < len; i++) {
      let comps = componentsInFolder(paths[i])
      if (name in comps) return comps[name]
    }
    return false
  })
}
