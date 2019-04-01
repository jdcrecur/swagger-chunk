import path from 'path'
import * as nunjucks from 'nunjucks'
import functionParamsFromStr from './functionParamsFromStr'

/**
 * mixin()
 * @param val
 * @param currentFilePointer
 * @returns {string}
 */
export default (val, currentFilePointer) => {
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
    return nunjucks.render(
      path.join(path.dirname(currentFilePointer), mixinPath),
      vars
    )
  }
  return val
}
