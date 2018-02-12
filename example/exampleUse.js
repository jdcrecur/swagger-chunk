const SwaggerChunk = require('../dist/SwaggerChunk.js')

new SwaggerChunk({
  input: './src/index.yml'
})
  .toYamlFile( './build', 'built' )