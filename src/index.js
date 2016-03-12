import path from "path"
import through from "through2"
import {PluginError} from "gulp-util"
import {name as PLUGIN_NAME} from "../package.json"

import FileProcessor from "./file-processor"

const DefaultOptions = {
  componentsFolders: [],
  transforms: []
}

export default function (options = {}) {
  options = Object.assign({}, DefaultOptions, options)
  
  return through.obj(function (file, encoding, cb) {
    try {
      if (file.isNull()) return cb(null, file)
      
      if (file.isStream()) file.contents = file.contents.setEncoding(null).read()
      
      options.componentsFolders = options.componentsFolders
        .slice(0)
        .concat([
          path.join(file.base, "/components"),
          path.resolve(require.main.filename || __filename, "../components")
        ])
      
      let processFile = FileProcessor(options)
      let output = processFile(file)
      for (let i = 0, len = output.length; i < len; i++) {
        this.push(output[i])
      }
      return cb()
    } catch (error) {
      this.emit("error", new PluginError(PLUGIN_NAME, error))
      return cb()
    }
  })
}
