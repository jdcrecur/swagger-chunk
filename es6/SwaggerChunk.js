const program = require('commander')
const fs = require('fs-extra')
const path = require('path')
const resolveRefs = require('json-refs').resolveRefs
const YAML = require('js-yaml')
const logErrorExit = (e) => {
  if (process.env.NODE_ENV === 'TEST') {
    console.log(process.cwd(), e)
    throw new Error(e)
  }
  else {
    console.error('error', e)
    process.exit()
  }
}

export default class SwaggerChunk {

  /**
   * @param program
   * {
   *  input: string,
   *  appendVersion:   ? bool defaults to false
   * }
   */
  constructor (program = {}) {
    if (!program.input) {
      logErrorExit('No input provided')
    }
    else {
      if (!fs.existsSync(program.input)) {
        logErrorExit('File does not exist. (' + program.input + ')')
      }
    }
    this.mainJSON = ''
    this.appendVersion = (program.exclude_version !== true)
    this.input = program.input
    this.hostReplacement = program.host_replacement || false
    this.cleanLeaf = program.clean_leaf || false
  }

  readJsonFile (file) {
    try {
      return JSON.parse(fs.readFileSync(file))
    }
    catch (err) {
      return null
    }
  }

  packageJson () {
    return this.readJsonFile('./package.json')
  }

  parseMain () {
    return new Promise((resolve, reject) => {
      const root = YAML.safeLoad(fs.readFileSync(this.input).toString())
      const options = {
        //filter: ['relative', 'remote'],
        loaderOptions: {
          processContent: (res, callback) => {
            try {
              callback(null, YAML.safeLoad(res.text))
            }
            catch (e) {
              logErrorExit({
                msg: 'Error parsing yml',
                e: e
              })
            }
          }
        }
      }

      resolveRefs(root, options).then((results) => {
        this.mainJSON = this.swaggerChunkConversions(results.resolved)
        return resolve(this.mainJSON)
      }).catch((e) => {
        return reject(e)
      })
    })
  }

  swaggerChunkConversions (swaggerDocument) {
    // Iterate over all paths and inject the rel. sec defs.
    for (let path in swaggerDocument.paths) {
      for (let method in swaggerDocument.paths[path]) {
        // Check is the method is allOff
        if (method === 'allOf') {
          let newObj = {}
          swaggerDocument.paths[path][method].forEach((item) => {
            for (let verb in item) {
              // console.log(item)
              newObj[verb] = item[verb]
            }
          })
          swaggerDocument.paths[path] = newObj
        }
      }
    }
    if (this.hostReplacement) {
      swaggerDocument.host = this.hostReplacement
    }
    if (this.cleanLeaf) {
      swaggerDocument = this.cleanLeafs(swaggerDocument)
    }
    return swaggerDocument
  }

  lastChar (string) {
    return string[string.length - 1]
  }

  removeLastChar (str) {
    return str.slice(0, -1)
  }

  cleanLeafs (swaggerDocument) {
    for (let key in swaggerDocument) {
      if (typeof swaggerDocument[key] === 'object') {
        swaggerDocument[key] = this.cleanLeafs(swaggerDocument[key])
      } else {
        if (this.lastChar(swaggerDocument[key]) === ',') {
          swaggerDocument[key] = this.removeLastChar(swaggerDocument[key])
        }
      }
    }
    return swaggerDocument
  }

  getVersion () {
    let swagVersion = ''
    if (!this.appendVersion) {
      return swagVersion
    }
    let parsedResltObj = this.mainJSON
    if (parsedResltObj.info.version) {
      swagVersion = parsedResltObj.info.version
    }
    else if (!program.Version) {
      const packageJson = (this.packageJson())
      if (packageJson.version) {
        swagVersion = packageJson.version
      }
      else {
        // try and get the version from the yml file
        return logErrorExit('No version provided and no version in the package.json')
      }
    }
    return '_' + swagVersion
  }

  getFileName (name, ext) {
    return name + this.getVersion() + '.' + ext
  }

  writeFile (dir, name, ext, contents) {
    try {
      fs.ensureDirSync(dir)
      return fs.writeFileSync(path.join(dir, this.getFileName(name, ext)), contents)
    }
    catch (e) {
      throw e
    }
  }

  toJsonFile (dir, name, ext, indentation = 2) {
    ext = ext || 'json'
    return new Promise((resolve, reject) => {
      this.toJSON().then((json) => {
        this.writeFile(dir, name, ext, JSON.stringify(json, null, indentation))
        resolve('File written to: ' + path.join(dir, this.getFileName(name, ext)))
      }).catch(reject)
    })
  }

  toJSON () {
    return new Promise((resolve, reject) => {
      this.parseMain().then((json) => {
        return resolve(json)
      }).catch(reject)
    })
  }

  toYamlFile (dir, name, ext) {
    ext = ext || 'yaml'
    return new Promise((resolve, reject) => {
      this.toYAML().then((yml) => {
        this.writeFile(dir, name, ext, yml)
        resolve('File written to: ' + path.join(dir, this.getFileName(name, ext)))
      }).catch(reject)
    })
  }

  toYAML () {
    return new Promise((resolve, reject) => {
      this.parseMain().then((json) => {
        // fix the allOff in paths
        return resolve(YAML.safeDump(json))
      }).catch(reject)
    })
  }
}
