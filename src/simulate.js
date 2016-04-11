// Copyright (c) Microsoft Corporation. All rights reserved.

var cordovaServe = require('cordova-serve'),
    path = require('path'),
    simulateServer = require('taco-simulate-server');

var launchServer = function(opts) {
    return simulateServer(opts, {
        simHostRoot: path.join(__dirname, 'sim-host'),
        node_modules: path.resolve(__dirname, '..', 'node_modules')
    })
};

var launchBrowser = function(target, url) {
    return cordovaServe.launchBrowser({ target: target, url: url });
};

var simulate = function(opts) {
    require('./server/server').attach(simulateServer.app);

    var target = opts.target || 'chrome';
    var simHostUrl;

    return launchServer(opts)
        .then(function(urls) {
            simHostUrl = urls.simHostUrl;
            return launchBrowser(target, urls.appUrl);
        }).then(function() {
            return launchBrowser(target, simHostUrl);
        }).catch(function(error) {
            // Ensure server is closed, then rethrow so it can be handled by downstream consumers.
            simulateServer.server && simulateServer.server.close();
            if (error instanceof Error) {
                throw error;
            } else {
                throw new Error(error);
            }
        });
};

module.exports = simulate;
module.exports.launchBrowser = launchBrowser;
module.exports.launchServer = launchServer;