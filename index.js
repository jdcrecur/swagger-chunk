const program = require('commander')
const SwaggerChunk = require('./es5/SwaggerChunk')
const pkg = require('./package.json')

program
  .version(pkg.version, '-v, --version')
  .option('-o, --output_format [format]', 'The output format yaml or json')
  .option('-i, --input [path]', 'The relative path to the input file')
  .option('-D, --destination [path]', 'Path to the target')
  .option('-d, --destination_name [name]', 'Base name of the file')
  .option('-h, --host_replacement [name]', '(swagger2 specific only) A host name string to replace the one found in the source')
  .option('-e, --extension [ext]', 'The output extension, defaults to the output format if not provided.')
  .option('-x, --exclude_version', '')
  .option('-c, --clean_leaf', 'This will strip all trailing "," from all values')
  .option('--init', 'Inject a skeleton yml structure to the current directory named /src/...')
  .parse(process.argv)

if (program.init) {
  return require('./init')
} else {
  const swaggerChunk = new SwaggerChunk(program)
  swaggerChunk[(program.output_format === 'yaml') ? 'toYamlFile' : 'toJsonFile'](
    program.destination,
    program.destination_name,
    program.extension || false
  ).then((resp) => {
    console.log('RESPONSE', resp)
  }).catch((err) => {
    console.log(err)
  })
}
