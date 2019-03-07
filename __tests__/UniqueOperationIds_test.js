const uniqueOperationIds = require('../es6/UniqueOperationIds')
let UniqueOperationIds

describe('Load the construct successfully', () => {
  it('load ../src/index.yml', (done) => {
    try {
      UniqueOperationIds = new uniqueOperationIds({
        input: './src/index.yml'
      })
      done()
    } catch (e) {
      done(e)
    }
  })
})

describe('getUniqueOperationIdFromPath', () => {
  it('getUniqueOperationIdFromPath v1/some/path/get should be v1SomePathGet', () => {
    UniqueOperationIds = new uniqueOperationIds({
      input: './src/index.yml'
    })
    expect(
      UniqueOperationIds.getUniqueOperationIdFromPath('src/paths/v1/weather/get.yml')
    ).toBe(
      'v1WeatherGet'
    )
  })

  it('getUniqueOperationIdFromPath wih custom strip value', () => {
    UniqueOperationIds = new uniqueOperationIds({
      input: './src/index.yml',
      strip_value: 'paths/'
    })
    expect(
      UniqueOperationIds.getUniqueOperationIdFromPath('src/paths/v1/weather/get.yml')
    ).toBe(
      'srcV1WeatherGet'
    )
  })
})

describe('uc first', () => {
  UniqueOperationIds = new uniqueOperationIds({
    input: './src/index.yml'
  })
  it('should work', () => {
    expect(
      UniqueOperationIds.ucFirst('abc')
    ).toBe(
      'Abc'
    )
  })
})

describe('isYml', () => {
  UniqueOperationIds = new uniqueOperationIds({
    input: './src/index.yml'
  })
  it('should work yml', () => {
    expect(UniqueOperationIds.isYml('something.yml')).toBe(true)
  })
  it('should work yaml', () => {
    expect(UniqueOperationIds.isYml('something.yml')).toBe(true)
  })
  it('should be false', () => {
    expect(UniqueOperationIds.isYml('something.yml.xtx')).toBe(false)
  })
})
