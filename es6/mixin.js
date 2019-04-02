import path from 'path'
import * as nunjucks from 'nunjucks'
import functionParamsFromStr from './functionParamsFromStr'

/**
 * mixin()
 * @param val
 * @param currentFilePointer
 * @returns {string}
 */
export default (val, currentFilePointer, linePadding) => {
  if (typeof val === 'string' && val.indexOf('mixin(') !== -1) {
    const params = functionParamsFromStr(val)
    let mixinPath = ''
    let vars = {}
    params.forEach((param, i) => {
      if (i > 0) {
        vars['var' + i] = param
      } else {
        mixinPath = param
      }
    })
    nunjucks.configure({autoescape:false});
    let rendered = nunjucks.render(
      path.join(path.dirname(currentFilePointer), mixinPath),
      vars
    )
    console.log(rendered)
    // inject the indentation
    let parts = rendered.split('\n')
    parts.forEach((part, i) => {
      parts[i] = linePadding + part
    })
    return parts.join('\n')
  }

  return val
}
