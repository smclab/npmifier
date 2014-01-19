
const path = require('path');
const fs = require('fs');
const readFileSync = fs.readFileSync;

const consoleModulePath = require.resolve('./console');
const consoleModuleSrc = fs.readFileSync(consoleModulePath, 'utf8');

const processModulePath = require.resolve('./process');
const processModuleSrc = fs.readFileSync(processModulePath, 'utf8');

const globalModulePath = require.resolve('./global');
const globalModuleSrc = fs.readFileSync(globalModulePath, 'utf8');

const bufferModulePath = require.resolve('insert-module-globals/buffer');
const bufferModuleSrc = fs.readFileSync(bufferModulePath, 'utf8');

module.exports = {

    console: function () {
        return {
            id: consoleModulePath,
            source: consoleModuleSrc,
            deps: {
                'util': require.resolve('browserify/node_modules/util')
            }
        }
    },

    process: function () {
        return {
            id: processModulePath,
            source: processModuleSrc
        }
    },

    global: function () {
        return {
            id: globalModulePath,
            source: globalModuleSrc
        }
    },

    Buffer: function () {
        return {
            id: bufferModulePath,
            source: bufferModuleSrc
        }
    },

    __filename: function (row, basedir) {
        var file = '/' + path.relative(basedir, row.id);
        return JSON.stringify(file);
    },

    __dirname: function (row, basedir) {
        var dir = path.dirname('/' + path.relative(basedir, row.id));
        return JSON.stringify(dir);
    }

}