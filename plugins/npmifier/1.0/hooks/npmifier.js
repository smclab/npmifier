exports.cliVersion = '>=3.2';

exports.init = function (logger, config, cli, appc) {

	function run(build, deviceFamily, deployType, finished) {

		console.log(' XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ');
		console.dir(arguments);
		console.log(' XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ');

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