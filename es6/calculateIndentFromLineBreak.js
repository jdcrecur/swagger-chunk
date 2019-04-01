/**
 *
 * @param {string} str
 * @param {number} pointer
 * @returns {number}
 */
export default (str, pointer) => {
  let spaceStart = false
  let spaceStartPointer = 0
  let spaceEndPointer = 0
  let spaceCorrection = 0
  for (let i = pointer; i >= 0; --i) {
    if (str[i] === ' ' && !spaceStart) {
      spaceStart = true
      spaceStartPointer = i
    } else if (str[i] === "\n" || i === 0) {
      spaceEndPointer = i
      if (i === 0 && spaceStartPointer !== 0) {
        // ++spaceCorrection
      }
      break
    } else if(str[i] !== ' ') {
      spaceStart = false
      spaceStartPointer = 0
    }
  }
  return (spaceStartPointer === 0) ? 0 : spaceStartPointer - spaceEndPointer + spaceCorrection
}
