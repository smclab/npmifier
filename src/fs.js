
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const nodefn = require('when/node/function');

function lift(from, name) {
	exports[ name ] = nodefn.lift(from[ name ]);
}

lift(fs, 'readFile');
lift(fs, 'writeFile');
lift(fs, 'stat');
lift(fs, 'rename');

exports.mkdirp = nodefn.lift(require('mkdirp'));

exports.mv = exports.rename;
exports.mvSVN = nodefn.lift(mvSVN);

exports.isFile = nodefn.lift(function (file, cb) {
	fs.stat(file, function (err, stat) {
		if (err && err.code === 'ENOENT') cb(null, false)
		else if (err) cb(err)
		else cb(null, stat.isFile() || stat.isFIFO())
	});
});

exports.isDirectory = nodefn.lift(function (file, cb) {
	fs.stat(file, function (err, stat) {
		if (err && err.code === 'ENOENT') cb(null, false)
		else if (err) cb(err);
		else cb(null, stat.isDirectory())
	});
});

exports.findSVN = function (start) {
	return (
		exports.isDirectory(path.resolve(start, '.svn'))
		.then(function (svn) {
			if (svn) return true;

			var newstart = path.resolve(start, '..');

			if (newstart === start) return false;

			return exports.findSVN(newstart);
		})
	);
};

function escape(arg) {
	return '"' + arg + '"';
}

function mvSVN(from, to, cb) {
	var cmd = [ 'svn', 'mv', escape(from), escape(to) ].join(' ');

	exec(cmd, function (err, stdout, stderr) {
		if (err) cb(err);
		else cb(null, [stdout, stderr]);
	});
}
