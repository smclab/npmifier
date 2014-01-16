#!/usr/bin/env node

var uglify = require('uglify-js');
var fs = require('fs');
var path = require('path');

var src = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'prelude.js'), 'utf8');
fs.writeFileSync(path.resolve(__dirname, '..', 'src', '_prelude.js'), uglify(src));
