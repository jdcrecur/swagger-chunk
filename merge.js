const program = require('commander')
const fs = require('fs')
const resolve = require('json-refs').resolveRefs
const YAML = require('js-yaml')

const logErrorExit = (e) => {
  console.error(e)
  process.exit()
}
const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file))
  } catch (err) {
    return null
  }
}
const packageJson = readJson('./package.json')

program
  .version('1.0.0', '-v, --version',)
  .option('-o, --output_format [format]', 'The output format yaml or json')
  .option('-i, --input [path]', 'The relative path to the input file')
  .option('-D, --destination [path]', 'Path to the target')
  .option('-d, --destination_name [name]', 'Base name of the file')
  .option('-V, --Version [version]', 'The version of the file added to the file name as a suffix, defaults to the version set in the swagger file, if not then the package.json version, else an error is thrown.')
  .option('-e, --extension [ext]', 'The output extension, defaults to the output format if not provided.')
  .parse(process.argv)

if (!program.input) {
  logErrorExit('No input provided')
} else {
  if (!fs.existsSync(program.input)) {
    logErrorExit('File does not exist. (' + program.input + ')')
  }
}

if (!program.output_format) {
  logErrorExit('No output provided')
}

if (!program.name) {
  logErrorExit('No name provided')
}

if (!program.extension) {
  program.extension = program.output_format
}

let root = YAML.safeLoad(fs.readFileSync(program.input).toString());
let options = {
  filter        : ['relative', 'remote'],
  loaderOptions : {
    processContent : function (res, callback) {
      try {
        let yml = YAML.safeLoad(res.text)
        callback(null, YAML.safeLoad(res.text));
      } catch (e) {
        logErrorExit({
          msg: 'Error parsing yml',
          e:e
        })
      }
    }
  }
};

resolve(root, options).then(function (results) {

  let resultObject = JSON.stringify(results.resolved, null, 2)
  let swagVersion = false

  let parsedResltObj = JSON.parse(resultObject)
  if( parsedResltObj.info.version ){
    swagVersion = parsedResltObj.info.version
  } else if (!program.Version) {
    if (packageJson.version) {
      swagVersion = packageJson.version
    } else {
      // try and get the version from the yml file
      logErrorExit('No version provided and no version in the package.json')
    }
  }

  if (program.output_format === 'yaml' ){
    resultObject = YAML.safeDump(results.resolved)
  }

  let outputFilename = program.destination + program.destination_name + '_' + swagVersion + '.' + program.extension

  fs.writeFile(outputFilename, resultObject, function(err) {
    if(err) {
      logErrorExit({
        error: 'Error writing the to the output destination',
        detail: err
      })
    } else {
      console.log("The file was saved!");
    }
  });
});