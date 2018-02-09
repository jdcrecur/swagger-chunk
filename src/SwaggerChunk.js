const program = require('commander')
const fs = require('fs')
const path = require('path')
const resolveRefs = require('json-refs').resolveRefs
const YAML = require('js-yaml')
const logErrorExit = (e) => {
  console.error(e)
  process.exit()
}

export default class SwaggerChunk {

  constructor (program) {
    if (!program.input) {
      logErrorExit('No input provided')
    }
    else {
      if (!fs.existsSync(program.input)) {
        logErrorExit('File does not exist. (' + program.input + ')')
      }
    }
    this.mainYaml = ''
    this.appendVersion = (!program.excludeVersion)
    this.input = program.input
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
        filter: ['relative', 'remote'],
        loaderOptions: {
          processContent: function (res, callback) {
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
        this.mainParsed = JSON.stringify(results.resolved, null, 2)
        return resolve(this.mainParsed)
      }).catch((e) => {
        return reject(e)
      })
    })
  }

  getVersion () {
    let swagVersion = ''
    if (!this.appendVersion) {
      return swagVersion
    }
    let parsedResltObj = JSON.parse(this.mainParsed)
    if (parsedResltObj.info.version) {
      swagVersion = parsedResltObj.info.version
    }
    else if (!program.Version) {
      const packageJson = (this.packageJson())
      if (packageJson.version) {
        swagVersion = packageJson.version
      } else {
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
      return fs.writeFileSync(path.join(dir, this.getFileName(name, ext), contents))
    } catch (e) {
      throw e
    }
  }

  toJsonFile (path, name, ext) {
    ext = ext || 'json'
    return new Promise((resolve, reject) => {
      this.toJSON().then((json) => {
        resolve(this.writeFile(path, name, ext, JSON.stringify(json)))
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

  toYamlFile (path, name, ext) {
    ext = ext || 'yaml'
    return new Promise((resolve, reject) => {
      this.toYAML().then((yml) => {
        resolve(this.writeFile(path, name, ext, yml))
      }).catch(reject)
    })
  }

  toYAML () {
    return new Promise((resolve, reject) => {
      this.parseMain().then((json) => {
        return resolve(YAML.safeDump(JSON.stringify(json)))
      }).catch(reject)
    })
  }
}