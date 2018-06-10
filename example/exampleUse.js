const SwaggerChunk = require('../es5/SwaggerChunk.js')

new SwaggerChunk({
  input: './src/index.yml'
})
  .toYamlFile( './build', 'built' )

new SwaggerChunk({
  input: './src/index.yml'
})
  .toJsonFile( './build', 'built' )
