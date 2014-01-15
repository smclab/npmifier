
const path = require('path');
const fs = require('fs');
const when = require('when');
const nodefn = require('when/node/function');
const xmldom = require('xmldom');

const slice = Array.prototype.slice;

const readFile = nodefn.lift(fs.readFile);
const writeFile = nodefn.lift(fs.writeFile);
const isFile = nodefn.lift(function (file, cb) {
	fs.stat(file, function (err, stat) {
		if (err && err.code === 'ENOENT') cb(null, false)
		else if (err) cb(err)
		else cb(null, stat.isFile() || stat.isFIFO())
	});
});
const isDirectory = nodefn.lift(function (file, cb) {
	fs.stat(file, function (err, stat) {
		if (err) cb(err);
		else cb(null, stat.isDirectory())
	});
});
const withFile = function (p) {
	return isFile(p).then(function (file) {
		if (file) return p;
		else throw new Error("Path '"+p+"' is not a file");
	});
};
const withDirectory = function (p) {
	return isDirectory(p).then(function (dir) {
		if (dir) return p;
		else throw new Error("Path '"+p+"' is not a directory");
	});
};

const TIAPP_FILENAME = 'tiapp.xml';
const LATEST = 'latest';
const DEPLOY_TYPES = [ 'development', 'test', 'production' ];

module.exports = TiApp;

TiApp.fromPath = fromPath;
TiApp.fromFile = fromFile;

TiApp.findTiAppXML = findTiAppXML;

function fromPath(p) {
	return TiApp.findTiAppXML(p).then(TiApp.fromFile);
}

function fromFile(p) {
	return readFile(p, 'utf8').then(function (src) {
		return new TiApp(src, p);
	});
}

function findTiAppXML(start) {
	return withDirectory(start).catch(function () {
		return path.dirname(start);
	})
	.then(function (p) {
		return path.resolve(p, TIAPP_FILENAME);
	})
	.then(withFile)
	.then(function (p) {
		return p;
	})
	.catch(function () {
		var nextstart = path.resolve(start, '..');
		if (nextstart === start) throw new Error("tiapp.xml not found");
		else return TiApp.findTiAppXML(nextstart);
	});
}

// Actual class
// ============

function TiApp(src, file) {
	this.file = file;
	this.src = src;
	this.doc = null;

	this.parseSource();
}

TiApp.prototype.saveToFile = function (file) {
	return writeFile((file || this.file), this.toString());
};

TiApp.prototype.toString = function toString() {
	var serializer = new xmldom.XMLSerializer();
	return serializer.serializeToString(this.doc);
};

TiApp.prototype.parseSource = function () {
	this.doc = new xmldom.DOMParser().parseFromString(this.src, 'text/xml');
	this.app = this.doc.documentElement;
};

TiApp.prototype.hasPlugin = function (id) {
	return this.getPlugins()[ id ] != null;
};

TiApp.prototype.uninstallPlugin = function(id) {
	var pluginsEl = this.getPluginsEl();
	var pluginEl = this.getPluginEl(id);

	if (!pluginsEl || !pluginEl) {
		return false;
	}

	pluginsEl.removeChild(pluginEl);

	return true;
};

TiApp.prototype.installPlugin = function (id, version) {
	var forceVersion = version != null;

	version || (version = LATEST);

	var pluginsEl = this.getPluginsEl();
	var plugins = this.getPlugins();

	if (!pluginsEl) {
		pluginsEl = this.doc.createElement('plugins');
		this.app.appendChild(pluginsEl);
	}

	if (plugins[ id ] && !forceVersion) {
		return false;
	}

	if (plugins[ id ] === version) {
		return false;
	}

	var pluginEl = this.getPluginEl(id);

	if (pluginEl) {
		if (version === LATEST) {
			pluginEl.removeAttribute('version');
		}
		else {
			pluginEl.setAttribute('version', version);
		}
	}
	else {
		pluginEl = this.doc.createElement('plugin');
		pluginEl.appendChild(this.doc.createTextNode(id));

		if (version !== LATEST) {
			pluginEl.setAttribute('version', version);
		}

		pluginsEl.appendChild(pluginEl);
		pluginsEl.appendChild(this.doc.createTextNode("\n"));
	}

	return true;
};

TiApp.prototype.getPlugins = function () {
	var plugins = {};

	var pluginsEl = this.getPluginsEl();

	if (!pluginsEl) return plugins;

	slice.call(pluginsEl.getElementsByTagName('plugin')).forEach(function (el) {
		var id = (el.textContent || '').trim();
		var version = el.getAttribute('version') || LATEST;

		plugins[ id ] = version;
	});

	return plugins;
};

TiApp.prototype.getModules = function (cfg) {
	var platform = cfg.platform || null;
	var platforms = cfg.platforms || [];
	var deployType = cfg.deployType || null;
	var deployTypes = cfg.deployTypes || [];

	if (platform) {
		platforms.push(platform);
	}

	if (deployType) {
		platforms.push(deployType);
	}

	var modules = this.getAllModules();

	if (platforms.length === 0 && deployTypes.length === 0) {
		return modules;
	}

	return modules.filter(function (m) {
		if (platforms.length > 0 && platforms.indexOf(m.platform) < 0) {
			return false;
		}

		if (deployTypes.length > 0 && deployTypes.indexOf(m.deployType) < 0) {
			return false;
		}

		return true;
	});
}

TiApp.prototype.getAllModules = function () {
	var platforms = this.getModulesIndex();
	var modules = [];

	Object.keys(platforms).forEach((function (platform) {
		Object.keys(platforms[platform]).forEach(function (id) {
			modules.push(platforms[ platform ][ id ]);
		}, this);
	}), this);

	return modules;
};

TiApp.prototype.getModulesIndex = function () {
	var platforms = {};

	var modulesEl = this.getModulesEl();

	if (!modulesEl) return platforms;

	slice.call(modulesEl.getElementsByTagName('module')).forEach(function (el) {
		var id = (el.textContent || '').trim();
		var version = el.getAttribute('version') || LATEST;
		var platform = el.getAttribute('platform');
		var deployType = el.getAttribute('deploy-type');

		platforms[platform] || (platforms[ platform ] = {});

		var module = platforms[ platform ][ id ];

		if (module) {
			module.deployTypes[deployType] = true;
		}
		else {
			module = {
				id: id,
				version: version,
				platform: platform,
				deployTypes: {
					development: !deployType ? true : deployType === 'development',
					test: !deployType ? true : deployType === 'test',
					production: !deployType ? true : deployType === 'production'
				}
			};
		}

		platforms[ platform ][ id ] = module;
	});

	return platforms;
};

TiApp.prototype.getRoots = function () {
	var roots = {};

	slice.call(this.app.childNodes).forEach(function (node) {
		if (!node.tagName) return;
		roots[ node.tagName ] = node.textContent;
	});

	return roots;
};

TiApp.prototype.getPluginEl = function (id) {
	var pluginsEl = this.getPluginsEl();

	if (!pluginsEl) {
		return undefined;
	}

	return slice.call(pluginsEl.getElementsByTagName('plugin')).filter(function (el) {
		return (el.textContent || '').trim() === id;
	})[0];
};

TiApp.prototype.getRootEl = function (tagName) {
	var els = slice.call(this.app.getElementsByTagName(tagName)).filter(function (el) {
		return this.app === el.parentNode;
	}, this);

	if (els.length > 1) {
		throw new Error("Too many <" + tagName + " /> in <ti:app />");
	}

	return els[0];
};

TiApp.prototype.getPluginsEl = function () {
	return this.getRootEl('plugins');
};

TiApp.prototype.getModulesEl = function (platform) {
	return this.getRootEl('modules');
};
