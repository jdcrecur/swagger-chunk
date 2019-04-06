const SwaggerChunk = require('./es5/SwaggerChunk.js')

const chunk = new SwaggerChunk({
  input: './src_3/index.yml',
})

const uniqueOperationIds = require('./es5/UniqueOperationIds')
const program = {
  make_unique_operation_ids: true,
  input: './src_3/index.yml',
}

const UniqueOperationIds = new uniqueOperationIds(program)
UniqueOperationIds
  .listAndInject()
  .then(() => {
    console.log('Building yaml')
    chunk
      .toYamlFile('./build', 'builtOA3')
      .then(() => {
        chunk
          .toYamlFile()
          .then(() => {
            console.log('Building json')
            chunk
              .toJsonFile('./build', 'builtOA3')
              .then(() => {
                chunk.toJsonFile()
              }).catch(e => console.error(e))
          }).catch(e => console.error(e))
      }).catch(e => console.error(e))
  })
  .catch(e => {
    console.error('Error injecting uniqueOperationIds: ', e)
  })
