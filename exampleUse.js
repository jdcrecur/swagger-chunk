const SwaggerChunk = require('./es5/SwaggerChunk.js')

const chunk = new SwaggerChunk({
  input: './src/index.yml',
})

console.log('Building yaml file')
chunk
  .toYamlFile( './build', 'built' )
  .then(() => {
    console.log('Building yaml console')
    chunk
      .toYamlFile()
      .then(() => {
        console.log('Building json')
        chunk
          .toJsonFile( './build', 'built' )
          .then( () => {
            chunk.toJsonFile()
          } ).catch(e => console.error(e))
      }).catch(e => console.error(e))
  }).catch(e => console.error(e))
