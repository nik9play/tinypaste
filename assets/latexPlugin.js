
import katex from 'katex'

const mathBlock = (code) => {
  let tex = ''
  code.split(/(?:\n\s*){2,}/).forEach((line) => { 
    try {
      tex += katex.renderToString(line.trim(), { displayMode: true })
    } catch (err) {
      tex += `<pre>${err}</pre>`
    }
  })
  return `<div>${tex}</div>`
}

const LatexPlugin = (md) => {
  const temp1 = md.renderer.rules.code_inline.bind(md.renderer.rules)
  md.renderer.rules.code_inline = (tokens, idx, options, env, slf) => {
    let code = tokens[idx].content
    if (code.startsWith('$') && code.endsWith('$')) {
      code = code.substr(1, code.length - 2)
      try {
        return katex.renderToString(code)
      } catch (err) {
        return `<code>${err}</code>`
      }
    }
    return temp1(tokens, idx, options, env, slf)
  }

  const temp2 = md.renderer.rules.fence.bind(md.renderer.rules)
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    let token = tokens[idx]
    let code = token.content.trim()
    if (token.info === 'math' || token.info === 'katex') {
      return mathBlock(code)
    }
    return temp2(tokens, idx, options, env, slf)
  }
}

export default LatexPlugin