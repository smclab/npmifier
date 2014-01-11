
require('colors');

const when = require('when');
const inquirer = require("inquirer");
const slice = Array.prototype.slice;

Object.defineProperty(exports, 'colors', (function () {

	var COLORS = true;

	function get() {
		return COLORS;
	}

	function set(colors) {
		COLORS = colors;
	}

	return {
		get: get,
		set: set
	};

}).call(null));

exports.endMessage = function () {
	console.log('');
};

exports.message = function (c) {
	var args = slice.call(arguments, 1);

	if (exports.colors !== false) {
		args[0] = args[0][c] || args[0];
	}

	if (c === 'green') {
		args[0] = " ✔  " + args[0];
	}
	else {
		args[0] = "    " + args[0];
	}

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

exports.prompts = function (questions) {
	return when.promise(function (resolve) {
		inquirer.prompt(questions, resolve);
	});
};

exports.yesno = function (message, def) {
	if (def === true) def = 'yes';
	if (def === false) def = 'no';

	return when.promise(function (resolve, reject) {
		return inquirer.prompt([
			{
				name: '__yesno__',
				type: 'confirm',
				prefix: function () { return 'XX'; },
				suffix: function () { return '>>'; },
				message: message,
				default: def
			}
		], function (result) {
			resolve(result.__yesno__);
		})
	});
};

function getYesNo(value) {
	value = (value + '').toLowerCase();
	return value.toLowerCase().charAt(0) === 'y';
}