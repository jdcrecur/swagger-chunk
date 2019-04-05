const SwaggerChunk = require('./es5/SwaggerChunk.js')

const chunk = new SwaggerChunk({
  input: './src_2/index.yml',
})

const uniqueOperationIds = require('./es5/UniqueOperationIds')
const program = {
  make_unique_operation_ids: true,
  input: './src_2/index.yml',
}
const UniqueOperationIds = new uniqueOperationIds(program)
UniqueOperationIds
  .listAndInject()
  .then(() => {
    chunk
      .toYamlFile('./build', 'built')
      .then(() => {
        chunk
          .toYamlFile()
          .then(() => {
            console.log('Building json')
            chunk
              .toJsonFile('./build', 'built')
              .then(() => {
                chunk.toJsonFile()
              }).catch(e => console.error(e))
          }).catch(e => console.error(e))
      }).catch(e => console.error(e))
  })
  .catch(e => {
    console.error('Error injecting uniqueOperationIds: ', e)
  })


