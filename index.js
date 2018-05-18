const program = require('commander')
const SwaggerChunk = require('./es5/SwaggerChunk')
const pkg = require('./package.json')

program
  .version(pkg.version, '-v, --version')
  .option('-o, --output_format [format]', 'The output format yaml or json')
  .option('-i, --input [path]', 'The relative path to the input file')
  .option('-D, --destination [path]', 'Path to the target')
  .option('-d, --destination_name [name]', 'Base name of the file')
  .option('-e, --extension [ext]', 'The output extension, defaults to the output format if not provided.')
  .option('-x, --exclude_version', '')
  .option('--init', 'Inject a skeleton yml structure to the current directory named /src/...')
  .parse(process.argv)

if (program.init) {
  const inquirer = require('inquirer')
  const fs = require('fs-extra')
  const pwd = process.cwd()
  const srcAlreadyExists = fs.pathExistsSync(pwd + '/src')
  if (srcAlreadyExists) {
    console.error('Process stopped as ' + pwd + '/src already found! Please double check you want to run this command here.')
    process.exit(0)
  } else {
    inquirer.prompt([{
      type: 'confirm',
      name: 'install_confirm',
      message: 'Install a swagger-chunk skeleton to this directory?',
      default: false
    }]).then((answers) => {
      if( answers.install_confirm ){
        fs.copy(__dirname + '/example/src', pwd + '/src', function (err) {
          if( err ){
            console.log( err )
          }else {
            console.log('Complete.')
          }
        });
      }
    })
  }
} else {
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
}
