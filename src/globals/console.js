
/*//var util = require('util');
var util = {};

var formatRegExp = /%[sdj%]/g;
util.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};

function isString(arg) {
  return typeof arg === 'string';
}*/

var util = require('util');

module.exports = new Console;

function Console() {}

Console.prototype.log = function() {
	return Ti.API.info(util.format.apply(util, arguments));
};

Console.prototype.info = function() {
	return Ti.API.info(util.format.apply(util, arguments));
};

Console.prototype.trace = function() {
	return Ti.API.trace(util.format.apply(util, arguments));
};

Console.prototype.warn = function() {
	return Ti.API.warn(util.format.apply(util, arguments));
};

Console.prototype.error = function() {
	return Ti.API.error(util.format.apply(util, arguments));
};

Console.prototype.dir = function(obj) {
  return console.log(util.inspect(obj));
};

Console.prototype.assert = function(ok, message) {
  if (ok !== true) return new Error(message || "Assertion failed");
};
