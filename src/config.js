
const path = require('path');
const when = require('when');
const nodefn = require('when/node/function');
const originalTitaniumConfig = require('titanium/lib/config');
const fs = require('./fs');

var configFile = originalTitaniumConfig.getConfigPath();
var configDir = path.dirname(configFile);

function ensureDirectory() {
	return (
		fs
		.stat(configDir)
		.then(function (stat) {
			if (stat.isDirectory()) return;
			else return when.reject(new Error("Config directory " + configDir + " is not a directory!"));
		}, function (err) {
			if (err.code === 'ENOENT') return;
			else return when.reject(err);
		})
		.yield(configDir)
		.then(fs.mkdirp)
	);
}

exports.read = function read() {
	return (
		ensureDirectory()
		.yield([ configFile, 'utf8' ])
		.spread(fs.readFile)
		.then(JSON.parse)
		.catch(function (err) {
			if (err.code === 'ENOENT') return {}
			else return when.reject(err);
		})
	);
};

exports.save = function save(cfg) {
	return (
		ensureDirectory()
		.yield([ configFile, JSON.stringify(cfg, null, '\t'), { encoding: 'utf8' } ])
		.spread(fs.writeFile)
		.then(exports.read)
	);
};
