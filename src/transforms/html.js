import posthtml from "posthtml"
import renderHTML from "posthtml-render"

function getTypeOfNode({attrs}, or) {
  if (attrs != null && attrs.type != null) {
    return attrs.type.split("/").slice(-1)[0].toLowerCase()
  } else { return or }
}

export const final = true

export function render(str, data) {
  let ret = {
    javascript: false,
    css: false,
    html: false
  }
  
  ret.html = posthtml()
    .use(tree => {
      tree.match({tag: "style"}, node => {
        ret[getTypeOfNode(node, "css")] = renderHTML(node.content)
        return []
      })
      tree.match({tag: "script"}, node => {
        ret[getTypeOfNode(node, "javascript")] = renderHTML(node.content)
        return []
      })
      tree.match({tag: "template"}, node => node.content)
    })
    .process(str, {sync: true})
    .html
  
  return ret
}


export function scope(id, nodes) {
  if (nodes.html) {
    nodes.html = posthtml()
      .use(tree => ({tag: "div", content: tree, attrs: {id}}))
      .process(nodes.html, {sync: true})
      .html
  }
  return nodes
}
