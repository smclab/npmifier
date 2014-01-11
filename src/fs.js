
const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const keys = require('when/keys');
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

exports.findCVS = function (start) {
	return keys.all({
		svn: exports.findToRoot(start, '.svn'),
		git: exports.findToRoot(start, '.git'),
		hg: exports.findToRoot(start, '.hg')
	});
};

exports.findToRoot = function (start, name) {
	return (
		exports.isDirectory(path.resolve(start, name))
		.then(function (svn) {
			if (svn) return true;

			var newstart = path.resolve(start, '..');

			if (newstart === start) return false;

			return exports.findToRoot(newstart, name);
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
