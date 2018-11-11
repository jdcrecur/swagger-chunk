'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var program = require('commander');
var fs = require('fs-extra');
var path = require('path');
require('colors');
var resolveRefs = require('json-refs').resolveRefs;
var YAML = require('js-yaml');
var validateSchema = require('openapi-schema-validation').validate;
var logErrorExit = function logErrorExit(e) {
  if (process.env.NODE_ENV === 'TEST') {
    console.log(process.cwd(), e);
    throw new Error(e);
  } else {
    console.error('error', e);
    process.exit();
  }
};

var SwaggerChunk = function () {

  /**
   * @param program
   * {
   *  input: string,
   *  appendVersion:   ? bool defaults to false
   * }
   */
  function SwaggerChunk() {
    var program = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, SwaggerChunk);

    if (!program.input) {
      logErrorExit('No input provided');
    } else {
      if (!fs.existsSync(program.input)) {
        logErrorExit('File does not exist. (' + program.input + ')');
      }
    }
    this.mainJSON = '';
    this.appendVersion = program.exclude_version !== true;
    this.input = program.input;
    this.hostReplacement = program.host_replacement || false;
    this.cleanLeaf = program.clean_leaf || false;
    this.validateOff = program.validate_off || false;
    this.destination = program.destination || false;
  }

  _createClass(SwaggerChunk, [{
    key: 'readJsonFile',
    value: function readJsonFile(file) {
      try {
        return JSON.parse(fs.readFileSync(file));
      } catch (err) {
        return null;
      }
    }
  }, {
    key: 'packageJson',
    value: function packageJson() {
      return this.readJsonFile('./package.json');
    }
  }, {
    key: 'parseMain',
    value: function parseMain() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var root = YAML.safeLoad(fs.readFileSync(_this.input).toString());
        var options = {
          loaderOptions: {
            processContent: function processContent(res, callback) {
              try {
                callback(null, YAML.safeLoad(res.text));
              } catch (e) {
                logErrorExit({
                  msg: 'Error parsing yml',
                  e: e
                });
              }
            }
          }
        };
        var pwd = process.cwd();
        process.chdir(path.dirname(_this.input));
        resolveRefs(root, options).then(function (results) {
          _this.mainJSON = _this.swaggerChunkConversions(results.resolved);
          _this.validate();
          process.chdir(pwd);
          return resolve(_this.mainJSON);
        }).catch(function (e) {
          process.chdir(pwd);
          return reject(e);
        });
      });
    }
  }, {
    key: 'validate',
    value: function validate() {
      if (!this.validateOff) {
        var validation = validateSchema(this.mainJSON, 2);
        if (validation.errors.length > 0) {
          validation.errors.forEach(function (error) {
            console.log('Property: '.red + error.property.red);
            console.log('     Error message: ' + error.message);
            console.log('     Stack message: ' + error.stack);
          });
          logErrorExit('Error found in swagger.');
        }
      } else {
        console.log('Validation turned off.');
      }
    }
  }, {
    key: 'swaggerChunkConversions',
    value: function swaggerChunkConversions(swaggerDocument) {
      // Iterate over all paths and inject the rel. sec defs.
      for (var _path in swaggerDocument.paths) {
        for (var method in swaggerDocument.paths[_path]) {
          // Check is the method is allOff
          if (method === 'allOf') {
            (function () {
              var newObj = {};
              swaggerDocument.paths[_path][method].forEach(function (item) {
                for (var verb in item) {
                  // console.log(item)
                  newObj[verb] = item[verb];
                }
              });
              swaggerDocument.paths[_path] = newObj;
            })();
          }
        }
      }
      if (this.hostReplacement) {
        swaggerDocument.host = this.hostReplacement;
      }
      if (this.cleanLeaf) {
        swaggerDocument = this.cleanLeafs(swaggerDocument);
      }
      return swaggerDocument;
    }
  }, {
    key: 'lastChar',
    value: function lastChar(string) {
      return string[string.length - 1];
    }
  }, {
    key: 'removeLastChar',
    value: function removeLastChar(str) {
      return str.slice(0, -1);
    }
  }, {
    key: 'cleanLeafs',
    value: function cleanLeafs(swaggerDocument) {
      for (var key in swaggerDocument) {
        if (_typeof(swaggerDocument[key]) === 'object') {
          swaggerDocument[key] = this.cleanLeafs(swaggerDocument[key]);
        } else {
          if (this.lastChar(swaggerDocument[key]) === ',') {
            swaggerDocument[key] = this.removeLastChar(swaggerDocument[key]);
          }
        }
      }
      return swaggerDocument;
    }
  }, {
    key: 'getVersion',
    value: function getVersion() {
      var swagVersion = '';
      if (!this.appendVersion) {
        return swagVersion;
      }
      var parsedResltObj = this.mainJSON;
      if (parsedResltObj.info.version) {
        swagVersion = parsedResltObj.info.version;
      } else if (!program.Version) {
        var packageJson = this.packageJson();
        if (packageJson.version) {
          swagVersion = packageJson.version;
        } else {
          // try and get the version from the yml file
          return logErrorExit('No version provided and no version in the package.json');
        }
      }
      return '_' + swagVersion;
    }
  }, {
    key: 'getFileName',
    value: function getFileName(name, ext) {
      return name + this.getVersion() + '.' + ext;
    }
  }, {
    key: 'writeFile',
    value: function writeFile(dir, name, ext, contents) {
      try {
        fs.ensureDirSync(dir);
        return fs.writeFileSync(path.join(dir, this.getFileName(name, ext)), contents);
      } catch (e) {
        throw e;
      }
    }
  }, {
    key: 'toJsonFile',
    value: function toJsonFile(dir, name, ext) {
      var _this2 = this;

      var indentation = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 2;

      this.destination = dir || false;
      ext = ext || 'json';
      console.log('Parsing to JSON file');
      return new Promise(function (resolve, reject) {
        _this2.toJSON().then(function (json) {
          if (!_this2.destination) {
            console.log(JSON.stringify(_this2.mainJSON, null, 4));
            return resolve();
          }
          _this2.writeFile(dir, name, ext, JSON.stringify(json, null, indentation));
          resolve('File written to: ' + path.join(dir, _this2.getFileName(name, ext)));
        }).catch(reject);
      });
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var _this3 = this;

      return new Promise(function (resolve, reject) {
        _this3.parseMain().then(function (json) {
          return resolve(json);
        }).catch(reject);
      });
    }
  }, {
    key: 'toYamlFile',
    value: function toYamlFile(dir, name, ext) {
      var _this4 = this;

      ext = ext || 'yaml';
      console.log('Parsing to ' + ext + ' file');
      this.destination = dir || false;
      return new Promise(function (resolve, reject) {
        _this4.toYAML().then(function (yml) {
          if (!_this4.destination) {
            console.log(yml);
            return resolve();
          }
          _this4.writeFile(dir, name, ext, yml);
          resolve('File written to: ' + path.join(dir, _this4.getFileName(name, ext)));
        }).catch(reject);
      });
    }
  }, {
    key: 'toYAML',
    value: function toYAML() {
      var _this5 = this;

      return new Promise(function (resolve, reject) {
        _this5.parseMain().then(function (json) {
          // fix the allOff in paths
          return resolve(YAML.safeDump(json));
        }).catch(reject);
      });
    }
  }]);

  return SwaggerChunk;
}();

exports.default = SwaggerChunk;
module.exports = exports.default;