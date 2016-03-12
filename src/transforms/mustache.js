import Mustache from "mustache"

export const final = false

export function render(str, data) {
  return {
    html: Mustache.render(str, data)
  }
}
