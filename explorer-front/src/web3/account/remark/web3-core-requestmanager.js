"use strict";
var givenProvider = require('./givenProvider.js');

/**
 * It's responsible for passing messages to providers
 * It's also responsible for polling the ethereum node for incoming messages
 * Default poll timeout is 1 second
 * Singleton
 */
var RequestManager = function RequestManager(provider) {
    this.provider = null;
    this.providers = RequestManager.providers;

    this.setProvider(provider);
    this.subscriptions = {};
};

RequestManager.givenProvider = givenProvider;

RequestManager.providers = {
    HttpProvider: require('./web3-providers-http')
};

module.exports = {
    Manager: RequestManager
};
