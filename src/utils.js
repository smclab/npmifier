
const when = require('when');
const prompt = require('prompt');
const slice = Array.prototype.slice;

prompt.message = ' • ';
prompt.delimiter = '';

exports.colors = true;

exports.endMessage = function () {
	console.log('');
};

exports.message = function (c) {
	var args = slice.call(arguments, 1);

	if (exports.colors !== false) {
		args[0] = args[0][c] || args[0];
	}

	args[0] = "  " + args[0];

	//console.log('');
	console.log.apply(console, args);
};

exports.log = function (c) {
	var args = slice.call(arguments, 1);

	if (exports.colors !== false) {
		args[0] = args[0][c] || args[0];
	}

	console.log.apply(console, args);
};

exports.promptCanceled = function (err) {
	if (err.message === 'canceled') {
		console.log('');
		process.exit();
	}
	else {
		return when.reject(err);
	}
};

exports.yesno = function (message, def) {
	if (def === true) def = 'yes';
	if (def === false) def = 'no';

	return when.promise(function (resolve, reject) {
		prompt.get({
			name: '__yesno__',
			message: message,
			warning: "Must respond yes or no",
			validator: /y[es]*|n[o]?/i,
			'default': def
		}, function (err, results) {
			if (err) reject(err);
			else resolve(getYesNo(results.__yesno__));
		});
	}).catch(exports.promptCanceled);
};

function getYesNo(value) {
	value = (value + '').toLowerCase();
	return value.toLowerCase().charAt(0) === 'y';
}