import SwaggerChunk from '../es6/SwaggerChunk'

let SC

const tryOrFail = (f, done) => {
  try {
    f()
    done()
  }
  catch (e) {
    done(e)
  }
}

describe('Load the construct', () => {
  it('should not fail with a simple import point', (done) => {
    tryOrFail(() => {
      SC = new SwaggerChunk({
        input: './example/src/index.yml'
      })
    }, done)
  })

  it('should not fail with a simple import point and exclude_version', (done) => {
    tryOrFail(() => {
      SC = new SwaggerChunk({
        input          : './example/src/index.yml',
        exclude_version: true
      })
    }, done)
  })

  it('should fail with missing input', (done) => {
    try {
      SC = new SwaggerChunk({
        exclude_version: true
      })
      done('Did not fail!')
    }
    catch (e) {
      done()
    }
  })
})

describe('Read to JSON', () => {
  SC = new SwaggerChunk({
    input          : './example/src/index.yml',
    exclude_version: true
  })

  it('Read the yml to JSON', (done) => {
    SC.toJSON().then((json) => {
      if( json.info.version === '1.1.1'){
        done()
      } else {
        done('Wrong number found')
      }
    }).catch((e) => {
      done(e)
    })
  })
})