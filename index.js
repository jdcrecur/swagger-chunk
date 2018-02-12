const program      = require('commander')
const SwaggerChunk = require('./dist/SwaggerChunk')

program
  .version('1.0.0', '-v, --version',)
  .option('-o, --output_format [format]', 'The output format yaml or json')
  .option('-i, --input [path]', 'The relative path to the input file')
  .option('-D, --destination [path]', 'Path to the target')
  .option('-d, --destination_name [name]', 'Base name of the file')
  .option('-e, --extension [ext]', 'The output extension, defaults to the output format if not provided.')
  .parse(process.argv)

const a = new SwaggerChunk(program)

a[(program.output_format === 'yaml') ? 'toYamlFile' : 'toJsonFile'](
  program.destination,
  program.destination_name,
  program.extension || false
).then((resp) => {
  console.log('RESPONSE', resp)
}).catch((err) => {
  console.log(err)
})
