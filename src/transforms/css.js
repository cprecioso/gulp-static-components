import postcss from "postcss"
import prefix from "postcss-prefix-selector"

export const final = true

export function render(str, data) {
  return {css: str}
}

export function scope(id, nodes) {
  if (nodes.css) {
    nodes.css = postcss()
      .use(prefix({
        prefix: `#${id} `,
        exclude: ["html"]
      }))
      .process(nodes.css)
      .css
  }
  return nodes
}
