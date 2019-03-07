'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var directoryWalk = function directoryWalk(currentDirPath, callback) {
    var baseChecked = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    console.log(currentDirPath);
    if (!baseChecked) {
        _fs2.default.accessSync(currentDirPath);
        baseChecked = true; // prevent this logic running again
    }
    _fs2.default.readdirSync(currentDirPath).forEach(function (name) {
        var filePath = _path2.default.join(currentDirPath, name);
        var stat = _fs2.default.statSync(filePath);
        if (stat.isFile()) {
            console.log('FILE');
            callback(filePath, stat);
        } else if (stat.isDirectory()) {
            directoryWalk(filePath, callback, baseChecked);
        }
    });
};

exports.default = directoryWalk;
module.exports = exports.default;