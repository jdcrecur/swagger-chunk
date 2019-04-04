import functionParamsFromStr from '../es6/functionParamsFromStr'

describe('functionParamsFromStr', () => {
  it('test single quotes', () => {
    let result = functionParamsFromStr("'this', 'is a test', 'text only'")
    expect(result).toEqual(['this', 'is a test', 'text only'])
  })

  it('test double quotes', () => {
    let result = functionParamsFromStr('"this", "is a test", "text only"')
    expect(result).toEqual(['this', 'is a test', 'text only'])
  })
})
