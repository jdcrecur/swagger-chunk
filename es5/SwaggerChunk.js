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
var logErrorExit = require('../logErrorExit');

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
    this.indentation = program.indentation || 4;
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
    key: 'parseMainLoaderOptions',
    value: function parseMainLoaderOptions() {
      return {
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
    }
  }, {
    key: 'parseMainRoot',
    value: function parseMainRoot() {
      return YAML.safeLoad(fs.readFileSync(this.input).toString());
    }
  }, {
    key: 'parseMain',
    value: function parseMain() {
      var _this = this;

      return new Promise(function (resolve) {
        var root = _this.parseMainRoot();
        var pwd = process.cwd();
        process.chdir(path.dirname(_this.input));
        resolveRefs(root, _this.parseMainLoaderOptions()).then(function (results) {
          _this.mainJSON = _this.swaggerChunkConversions(results.resolved);
          _this.validate().then(function () {
            process.chdir(pwd);
            return resolve(_this.mainJSON);
          }).catch(function (e) {
            logErrorExit({
              msg: 'Error parsing output',
              e: e
            });
          });
        }).catch(function (e) {
          logErrorExit({
            msg: 'Error resolving',
            e: e
          });
        });
      });
    }
  }, {
    key: 'validate',
    value: function validate() {
      var _this2 = this;

      return new Promise(function (resolve, reject) {
        if (!_this2.validateOff) {
          var SwaggerParser = require('swagger-parser');
          SwaggerParser.validate(_this2.cloneObject(_this2.mainJSON), {}, function (e) {
            if (e) {
              return reject(e.message);
            }
            return resolve();
          });
        } else {
          return resolve();
        }
      });
    }
  }, {
    key: 'cloneObject',
    value: function cloneObject(src) {
      return JSON.parse(JSON.stringify(src));
    }
  }, {
    key: 'swaggerChunkConversions',
    value: function swaggerChunkConversions(swaggerDocument) {
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
        logErrorExit({
          msg: 'Error writing file',
          e: e
        });
      }
    }
  }, {
    key: 'toJsonFile',
    value: function toJsonFile(dir, name, ext) {
      var _this3 = this;

      this.destination = dir || false;
      ext = ext || 'json';
      return new Promise(function (resolve, reject) {
        _this3.toJSON().then(function (json) {
          if (!_this3.destination) {
            console.log(JSON.stringify(_this3.mainJSON, null, 4));
            return resolve();
          }
          _this3.writeFile(dir, name, ext, JSON.stringify(json, null, _this3.indentation));
          resolve('File written to: ' + path.join(dir, _this3.getFileName(name, ext)));
        }).catch(reject);
      });
    }
  }, {
    key: 'toJSON',
    value: function toJSON() {
      var _this4 = this;

      return new Promise(function (resolve, reject) {
        _this4.parseMain().then(function (json) {
          return resolve(json);
        }).catch(reject);
      });
    }
  }, {
    key: 'toYamlFile',
    value: function toYamlFile(dir, name, ext) {
      var _this5 = this;

      ext = ext || 'yaml';
      this.destination = dir || false;
      return new Promise(function (resolve, reject) {
        _this5.toYAML().then(function (yml) {
          if (!_this5.destination) {
            console.log(yml);
            return resolve();
          }
          _this5.writeFile(dir, name, ext, yml);
          resolve('File written to: ' + path.join(dir, _this5.getFileName(name, ext)));
        }).catch(reject);
      });
    }
  }, {
    key: 'toYAML',
    value: function toYAML() {
      var _this6 = this;

      return new Promise(function (resolve, reject) {
        _this6.parseMain().then(function (json) {
          return resolve(YAML.safeDump(json, _this6.indentation));
        }).catch(reject);
      });
    }
  }]);

  return SwaggerChunk;
}();

exports.default = SwaggerChunk;
module.exports = exports.default;