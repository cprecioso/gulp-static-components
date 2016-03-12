import posthtml from "posthtml"
import renderHTML from "posthtml-render"
import gutil from "gulp-util"
import path from "path"

import ComponentFetcher from "./component-fetcher"
import ComponentImporter from "./component-importer"

const CustomComponentTagRegEx = /^[a-z]+(-[a-z]+)+$/i

export default function FileProcessor(options) {
  let fetchComponent = ComponentFetcher(options)
  let importComponent = ComponentImporter(options)
  
  return function processFile(file) {
    let name = path.basename(file.path, path.extname(file.path))
    
    let cache = {
      js: "",
      css: "",
      html: ""
    }
    
    cache.html = posthtml()
      .use(PosthtmlProcessor(name, fetchComponent, importComponent, cache))
      .process(file.contents.toString("utf8"), {sync: true})
      .html
    
    let output = []
    for (let ext in cache) {
      let contents = cache[ext]
      if (contents) output.push(cloneFile(file, ext, contents))
    }
    return output
  }
}

function cloneFile(file, extension, contents) {
  let newFile = new gutil.File({
    cwd: file.cwd,
    base: file.base,
    path: file.path,
    contents: new Buffer(contents, "utf8")
  })
  newFile.extname = "." + extension
  return newFile
}

function PosthtmlProcessor(name, fetcher, importer, cache) {
  return function processPosthtml (tree) {
    tree.match({tag: CustomComponentTagRegEx}, node => {
      let componentPath = fetcher(node.tag)
      if (!componentPath) return node
      let data = Object.assign({content: renderHTML(node.content)}, node.attrs)
      let el = importer(componentPath, data)
      if (el.css) cache.css += el.css
      if (el.javascript) cache.js += el.js
      return el.html
    })
    
    if (cache.css || cache.js) {
      tree.match({tag: "head"}, node => {
        if (cache.css) {
          node.content.push({
            tag: "link",
            attrs: {
              rel: "stylesheet",
              href: name + ".css"
            }
          })
        }
        if (cache.js) {
          node.content.push({
            tag: "script",
            attrs: { src: name + ".js" }
          })
        }
        return node
      })
    }
    
    return tree
  }
}
