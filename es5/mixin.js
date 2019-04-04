'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nunjucks = require('nunjucks');

var nunjucks = _interopRequireWildcard(_nunjucks);

var _functionParamsFromStr = require('./functionParamsFromStr');

var _functionParamsFromStr2 = _interopRequireDefault(_functionParamsFromStr);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * mixin()
 * @param val
 * @param currentFilePointer
 * @param linePadding
 * @returns {string}
 */
exports.default = function (val, currentFilePointer, linePadding) {
  if (typeof val === 'string' && val.indexOf('mixin(') !== -1) {
    var params = (0, _functionParamsFromStr2.default)(val);
    var mixinPath = '';
    var vars = {};
    params.forEach(function (param, i) {
      if (i > 0) {
        vars['var' + i] = param;
      } else {
        mixinPath = param;
      }
    });
    nunjucks.configure({ autoescape: false });
    var rendered = nunjucks.render(_path2.default.join(_path2.default.dirname(currentFilePointer), mixinPath), vars);
    // inject the indentation
    var parts = rendered.split('\n');
    parts.forEach(function (part, i) {
      parts[i] = linePadding + part;
    });
    return parts.join('\n');
  }

  return val;
};

module.exports = exports.default;