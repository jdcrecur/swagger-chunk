const program = require('commander')
const SwaggerChunk = require('./es5/SwaggerChunk')
const pkg = require('./package.json')

program
  .version(pkg.version, '-v, --version')
  .option('--init', 'Inject a skeleton yml structure to the current directory named /src/...')
  .option('-c, --clean_leaf', 'This will strip all trailing "," from all values')
  .option('-d, --destination_name [name]', 'Base name of the file')
  .option('-D, --destination [path]', 'Path to the target')
  .option('-e, --extension [ext]', 'The output extension, defaults to the output format if not provided.')
  .option('-h, --host_replacement [name]', '(swagger2 specific only) A host name string to replace the one found in the source')
  .option('-i, --input [path]', 'The relative path to the input file')
  .option('-o, --output_format [format]', 'The output format yaml, yml or json. If not provided it will assume the format of the input file.')
  .option('-V, --validate_off', 'Do not validate the swagger output')
  .option('-x, --exclude_version', 'Exclude the swagger version from the generated output file. ')
  .parse(process.argv)

if (program.init) {
  return require('./init')
} else {
  const calculateOutputFormat = () => {
    if(program.output_format){
      return program.output_format
    } else {
      return program.input.split('.').pop()
    }
  }
  const swaggerChunk = new SwaggerChunk(program)
  swaggerChunk[(['yaml', 'yml'].indexOf(calculateOutputFormat()) !== -1) ? 'toYamlFile' : 'toJsonFile'](
    program.destination,
    program.destination_name,
    program.extension || false
  ).then((resp) => {
    console.log('RESPONSE', resp)
  }).catch((err) => {
    console.log(err)
  })
}
