
const path = require('path');
const browserify = require('browserify');
const convert = require('convert-source-map');
const when = require('when');
const keys = require('when/keys');
const nodefn = require('when/node/function');
const titaniumPlatformResolve = require('titanium-platform-resolve');

const fs = require('../../../../src/fs');
const TiApp = require('../../../../src/tiapp');
const version = (require('../../../../package').version);

const EMPTY_SRC = "";
const APP_SRC = "require('bundle');";

const PRELUDE_PATH = path.resolve(__dirname, '..', '..', '..', '..', 'src', '_prelude.js');
const PRELUDE_SRC = require('fs').readFileSync(PRELUDE_PATH, 'utf8');

const BANNER = [
"____________________#####",
"#####################___#############",
"#____#____#______#__#__##__#____#___#",
"#__#_#__#_#__#_#_#__#___#__#____#__##",
"#__#_#__#_#__#_#_#__#__##__#__###__#",
"#__#_#____#__#_#_#__#__##__#____#__#",
"######__############################",
"_____####______________version " + version + "  made by " + "SMC".red
].map(function (line) {
	return line.split('').map(function (char) {
		if (char === '#') return '██';
		else if (char === '_') return '  ';
		else return char;
	}).join('');
}).concat(['']);

function getSourceMapFromSource(src, filename, projectDir) {
	var comments = src.split(/[\n\r]+/g).filter(function (line) {
		line = line.trim();
		return line.slice(0, 3) === '//@' || line.slice(0, 3) === '//#';
	});

	var comment = comments[0];

	if (!comment) {
		throw new Error("Source map not found");
	}

	var result = convert.fromComment(comment);

	var sources = result.getProperty('sources').map(function (source) {
		return path.relative(projectDir, source);
	});

	result = result.setProperty('file', filename);
	result = result.setProperty('sources', sources);

	return result.toJSON();
}

exports.cliVersion = '>=3.2';

exports.init = function (logger, config, cli, appc) {

	function run(build, deviceFamily, deployType, finished) {

		BANNER.forEach(function (line) {
			logger.info(line.white);
		});

		var pkg = require(path.join(build.projectDir, 'package.json'));

		var opts = pkg.npmify || pkg.browserify || {};

		opts.extensions || (opts.extensions = [ '.js', '.json' ]);
		opts.transforms || (opts.transforms = []);

		opts.transforms = opts.transforms.map(function (tr) {
			return require(tr);
		});

		opts.transforms.push(titaniumPlatformResolve.createTransform({
			platforms: [ build.platformName ],
			extensions: opts.extensions
		}));

		TiApp.fromPath(build.projectDir).then(function (tiapp) {

			var externals = tiapp.getModules({
				platform: build.platformName,
				deployType: deployType
			}).map(function (module) {
				return module.id;
			});

			var b = browserify({
				extensions: opts.extensions
			});

			b.add(build.projectDir);

			opts.transforms.forEach(function (transform) {
				b.transform(transform);
			});

			externals.forEach(function (external) {
				b.exclude(external);
			});

			return b;

		}).then(function (b) {
			logger.error(PRELUDE_PATH);
			return nodefn.call(b.bundle.bind(b), {
				debug: deviceFamily !== 'production',
				ignoreMissing: false,
				standalone: pkg.name,
				prelude: PRELUDE_SRC,
				preludePath: PRELUDE_PATH//'build/map/prelude.js'
			});
		})
		.then(function (src) {
			return when.all([
				fs.mkdirp(path.join(build.projectDir, 'Resources', build.platformName)),
				fs.mkdirp(path.join(build.projectDir, 'build', 'map', 'Resources', build.platformName))
			]).yield(src);
		})
		.then(function (src) {
			var sourceMap = getSourceMapFromSource(src, 'Resources/' + build.platformName + '/bundle.js.js', build.projectDir);

			return when.all([
				fs.writeFile(path.join(build.projectDir, 'Resources', 'app.js'), EMPTY_SRC),
				fs.writeFile(path.join(build.projectDir, 'Resources', build.platformName, 'bundle.js'), src),
				fs.writeFile(path.join(build.projectDir, 'build', 'map', 'prelude.js'), PRELUDE_SRC),
				fs.writeFile(path.join(build.projectDir, 'build', 'map', 'Resources', build.platformName, 'bundle.js.map'), sourceMap),
				fs.writeFile(path.join(build.projectDir, 'Resources', build.platformName, 'app.js'), APP_SRC)
			]).yield(src);
		})
		.done(function () {
			logger.info("NPMification complete");
			finished();
		}, function (err) {
			logger.error(err);
			finished(err);
		});
	}

	cli.addHook('build.pre.compile', function (build, finished) {

		var deployType = build.deployType;

		if (cli.argv.platform === 'android') {
			switch(cli.argv.target) {
				case 'dist-playstore':
					deployType = 'production';
					break;
				case 'device':
					deployType = 'test';
					break;
				case 'emulator':
				default:
					deployType = 'development';
					break;
			}
		}

		run(build, build.deviceFamily, deployType, finished);
	});

};