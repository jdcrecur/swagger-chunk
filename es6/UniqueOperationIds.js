import fs from 'fs'
import path from 'path'
const Walker = require('walker')
const YAML = require('js-yaml')
const logErrorExit = require('../logErrorExit')

export default class UniqueOperationIds {
  constructor(program){
    if (!program.input) {
      logErrorExit('No input provided')
    } else {
      if (!fs.existsSync(program.input)) {
        logErrorExit('File does not exist. (' + program.input + ')')
      }
    }
    this.input = path.dirname(program.input)
    this.stripValue = 'src/paths/'
    this.indentation = 4
  }
  ucFirst (s) {
    if (typeof s !== 'string') {
      return ''
    }
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
  isYml (filePath) {
    return ['yml','yaml'].indexOf(
      path.extname(filePath).substring(1)
    ) !== -1
  }
  getUniqueOperationIdFromPath (filePath) {
    filePath = filePath.replace(this.stripValue, '')
    filePath = filePath.replace(path.extname(filePath), '')
    let filePathParts = filePath.split('/')
    for(let i = 0 ; i < filePathParts.length ; ++i){
      if(i !== 0 ){
        filePathParts[i] = this.ucFirst(filePathParts[i])
      }
    }
    return filePathParts.join('');
  }
  readYmlToJson (filePath) {
    return YAML.safeLoad(
      fs.readFileSync(filePath).toString()
    )
  }
  writeJsonToYaml (filePath, json) {
    return fs.writeFileSync(
      filePath,
      YAML.safeDump(
        json,
        this.indentation
      )
    )
  }
  injectUniqueOperationId(filePath){
    const uniqueOpId = this.getUniqueOperationIdFromPath(filePath)
    let json = this.readYmlToJson(filePath)
    if(json.summary || json.description){
      json.operationId = uniqueOpId
    } else {
      for(const key in json){
        if(json[key].summary || json[key].description){
          json[key].operationId = uniqueOpId
        }
      }
    }
    return this.writeJsonToYaml(filePath, json)
  }
  listInputDirectory(){
    return new Promise((resolve, reject) => {
      Walker(this.input)
        .on('file', (file) => {
          if(this.isYml(file) && file.includes('paths/') && !file.includes('index')){
              this.injectUniqueOperationId(file)
          }
        })
        .on('error', (err, entry) => {
          console.log('Got error reading file: ' + entry)
          reject(err)
        })
        .on('end', () => {
          resolve()
        })
    })
  }
}
