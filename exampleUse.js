const SwaggerChunk = require('./es5/SwaggerChunk.js')

new SwaggerChunk({
  input: './src/index.yml',
  host_replacement: 'www.myapi.com',
  clean_leaf: true,
})
  .toYamlFile( './build', 'built' )

new SwaggerChunk({
  input: './src/index.yml',
  host_replacement: 'www.myapi.com',
  clean_leaf: true,
})
  .toJsonFile( './build', 'built' )
