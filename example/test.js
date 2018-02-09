import SwaggerChunk from '../src/SwaggerChunk'

new SwaggerChunk({
  input: './src/index.yml',
  excludeVersion: true
})
  .toJsonFile('./build/', 'swagger')
