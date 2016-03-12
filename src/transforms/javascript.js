import fs from "fs"
import path from "path"

export const final = true

export function render(str, data) {
  return {javascript: str}
}

export function scope(id, nodes, data) {
  if (nodes.javascript) {
    let template = fs.readFileSync(path.resolve(__filename, "js_template.js"), "utf8")
    nodes.javascript = template
      .replace("$$CONTENT$$", nodes.javascript)
      .replace("$$ID$$", id)
      .replace("$$DATA$$", JSON.stringify(data))
  }
  return nodes
}
