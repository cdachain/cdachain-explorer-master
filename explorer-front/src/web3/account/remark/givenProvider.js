"use strict";

var givenProvider = null;

// ADD GIVEN PROVIDER
/* jshint ignore:start */
var global = Function('return this')();

// EthereumProvider
if(typeof global.ethereumProvider !== 'undefined') {
    givenProvider = global.ethereumProvider;

// Legacy web3.currentProvider
} else if(typeof global.web3 !== 'undefined' && global.web3.currentProvider) {

    if(global.web3.currentProvider.sendAsync) {
        global.web3.currentProvider.send = global.web3.currentProvider.sendAsync;
        delete global.web3.currentProvider.sendAsync;
    }

    // if connection is 'ipcProviderWrapper', add subscription support
    if(!global.web3.currentProvider.on &&
        global.web3.currentProvider.connection &&
        global.web3.currentProvider.connection.constructor.name === 'ipcProviderWrapper') {

        global.web3.currentProvider.on = function (type, callback) {

            if(typeof callback !== 'function')
                throw new Error('The second parameter callback must be a function.');

            switch(type){
                case 'data':
                    this.connection.on('data', function(data) {
                        var result = '';

                        data = data.toString();

                        try {
                            result = JSON.parse(data);
                        } catch(e) {
                            return callback(new Error('Couldn\'t parse response data'+ data));
                        }

                        // notification
                        if(!result.id && result.method.indexOf('_subscription') !== -1) {
                            callback(null, result);
                        }

                    });
                    break;

                default:
                    this.connection.on(type, callback);
                    break;
            }
        };
    }

    givenProvider = global.web3.currentProvider;
}
/* jshint ignore:end */

module.exports = givenProvider;
