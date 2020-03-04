import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

import './latexPlugin'

import markdown_anchor from 'markdown-it-anchor'
import markdown_task_lists from 'markdown-it-task-lists'

import MDIT from 'markdown-it'
import LatexPlugin from './latexPlugin'

export const mdOptions = {
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre><code>' +
          hljs.highlight(lang, str).value +
          '</code></pre>'
      } catch (__) {}
    }

    return ''
  },
  linkify: true,
  typographer: true
}

export const md = new MDIT(mdOptions)
  .use(markdown_anchor, { permalink: true, permalinkBefore: false, permalinkSpace: true,
    permalinkSymbol: `#` })
  .use(markdown_task_lists).use(LatexPlugin)

// let defaultCodeRender = md.renderer.rules.fence 

// md.renderer.rules.fence = function (tokens, idx, options, env, self) {
//   if (tokens[idx].info == "math") {
//     return `<div>` +
//     katex.renderToString(tokens[idx].content, {throwOnError: false, displayMode: true})+
//     '</div>\n'
//   }
//   return defaultCodeRender(tokens, idx, options, env, self)
// }

md.renderer.rules.table_open = (tokens, idx, options, env, self) => {
  return `<div class="table-container"><table>`
}

md.renderer.rules.table_close = (tokens, idx, options, env, self) => {
  return `</table></div>`
}