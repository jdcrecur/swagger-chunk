const inquirer = require('inquirer')
const fs = require('fs-extra')
const pwd = process.cwd()
const path = require('path')
const srcPath = path.join(pwd, '/src')
const srcAlreadyExists = fs.pathExistsSync(srcPath)
const buildPath = path.join(pwd, '/build')
const buildAlreadyExists = fs.pathExistsSync(srcPath)

if (srcAlreadyExists || buildAlreadyExists) {
  return console.error('Process stopped as ' + srcAlreadyExists + ' &/or' + buildPath + 'already found! Please double check you want to run this command here.')
} else {
  inquirer.prompt([{
    type: 'confirm',
    name: 'install_confirm',
    message: 'Install a swagger-chunk skeleton to this directory?',
    default: false
  }]).then((answers) => {
    if (answers.install_confirm) {
      fs.copySync(__dirname + '/example/src', srcPath)
      fs.copySync(__dirname + '/example/build', buildPath)
      console.log('Complete: Initialized swagger-chunk files to ' + srcPath)
      inquirer.prompt([{
        type: 'confirm',
        name: 'scripts_add_confirm',
        message: 'Automatically add the swagger-chunk build scripts to your package.json file?',
        default: true
      }]).then((answers) => {
        if (answers.scripts_add_confirm) {
          const localPkgJsonPath = path.join(pwd, 'package.json')
          if (!fs.pathExistsSync(localPkgJsonPath)) {
            return console.error('Error: No package.json file found thus adding the swagger-chunk scripts has been aborted.')
          }
          const localPkgJson = require(localPkgJsonPath)
          localPkgJson.scripts['build:json'] = 'node node_modules/swagger-chunk -i ./src/index.yml -o json -D ./build/ -d swagger2_api'
          localPkgJson.scripts['build:yaml'] = 'node node_modules/swagger-chunk -i ./src/index.yml -o yaml -e yml -D ./build/ -d swagger2_api'
          localPkgJson.scripts['build:all'] = 'npm run build:json && npm run build:yaml'

          // Write the new json object to file
          fs.writeFileSync(localPkgJsonPath, JSON.stringify(localPkgJson, null, 4))

          return console.log('Complete: swagger-chunk scripts added to your package.json file.')
        }
      })
    }
  })
}
