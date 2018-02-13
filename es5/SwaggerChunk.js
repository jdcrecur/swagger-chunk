'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var program = require('commander');
var fs = require('fs');
var path = require('path');
var resolveRefs = require('json-refs').resolveRefs;
var YAML = require('js-yaml');
var logErrorExit = function logErrorExit(e) {
  console.error('error', e);
  process.exit();
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


    this.mainJSON = '';
    this.appendVersion = (program.exclude_version !== true);
    console.log(this.appendVersion)
    if (!program.input) {
      logErrorExit('No input provided');
    } else {
      if (!fs.existsSync(program.input)) {
        logErrorExit('File does not exist. (' + program.input + ')');
      }
    }
    this.input = program.input;
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
          filter: ['relative', 'remote'],
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

        resolveRefs(root, options).then(function (results) {
          _this.mainJSON = results.resolved;
          return resolve(_this.mainJSON);
        }).catch(function (e) {
          return reject(e);
        });
      });
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
        return fs.writeFileSync(path.join(dir, this.getFileName(name, ext)), contents);
      } catch (e) {
        throw e;
      }
    }
  }, {
    key: 'toJsonFile',
    value: function toJsonFile(dir, name, ext) {
      var _this2 = this;

      ext = ext || 'json';
      return new Promise(function (resolve, reject) {
        _this2.toJSON().then(function (json) {
          _this2.writeFile(dir, name, ext, JSON.stringify(json));
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
      return new Promise(function (resolve, reject) {
        _this4.toYAML().then(function (yml) {
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
          return resolve(YAML.safeDump(json));
        }).catch(reject);
      });
    }
  }]);

  return SwaggerChunk;
}();

exports.default = SwaggerChunk;
module.exports = exports['default'];