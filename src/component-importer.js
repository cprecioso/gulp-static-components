import path from "path"
import {readFileSync} from "fs"
import * as transforms from "./transforms/index"

const SCOPING_BASE = 36
const MAX_SCOPING = parseInt("zzzzzz", 36)

export default function ComponentImporter(options) {
  //let {transforms} = options
  
  return function componentFromFile(file, data) {
    let ext = path.extname(file).slice(1)
    let name = path.basename(file, ext).slice(0, -1)
    let str = readFileSync(file, {encoding: "utf8"})
    return componentFromString(name, str, ext, data)
  }
  
  function componentFromString(name, str, type, data) {
    return scopeComponents(
      name,
      renderComponent({[type]: str}, name, data),
      data
    )
  }
  
  function renderComponent(nodes, name, data) {
    let final = {}
    let notFinal = false
    
    for (let type in nodes) {
      let str = nodes[type]
      if (!(type in transforms)) {
        final[type] = str
        continue
      }
      let transform = transforms[type]
      let transformed = transform.render(str, data)
      Object.assign(
        transform.final ? final : (notFinal || (notFinal = {})),
        transformed
      )
    }
    
    if (notFinal)
      Object.assign(final, renderComponent(notFinal, name, data))
    return final
  }
  
  function scopeComponents(name, nodes, data) {
    let valid = ["javascript", "css", "html"]
    for (let type in nodes) {
      if (valid.indexOf(type) < 0)
        throw new Error(`Type ${type} not valid`)
    }
    
    let randomId = Math.floor(Math.random() * MAX_SCOPING).toString(SCOPING_BASE)
    let id = `${name}_${randomId}`
    
    if (nodes.html) nodes = transforms.html.scope(id, nodes, data)
    if (nodes.css) nodes = transforms.css.scope(id, nodes, data)
    if (nodes.javascript) nodes = transforms.javascript.scope(id, nodes, data)
    
    return nodes
    
  }
  
}
