const SwaggerChunk = require('./es5/SwaggerChunk.js')

const chunk = new SwaggerChunk({
  input: './src/index.yml',
  host_replacement: 'www.myapi.com',
  clean_leaf: true,
})

chunk
  .toYamlFile( './build', 'built' )
  .then(() => {
    chunk
      .toYamlFile()
      .then(() => {
        chunk
          .toJsonFile( './build', 'built' )
          .then( () => {
            chunk.toJsonFile()
          } )
      })
  })
