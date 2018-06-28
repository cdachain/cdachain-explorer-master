
"use strict";


var requestManager = require('./web3-core-requestmanager');

module.exports = {
    packageInit: function (pkg, args) {
        args = Array.prototype.slice.call(args);

        if (!pkg) {
            throw new Error('You need to instantiate using the "new" keyword.');
        }


        // make property of pkg._provider, which can properly set providers
        //Object.defineProperty在一个对象上定义一个新属性，或者修改一个对象的现有属性
        Object.defineProperty(pkg, 'currentProvider', {
            get: function () {
                return pkg._provider;
            },
            set: function (value) {
                return pkg.setProvider(value);
            },
            enumerable: true,//可枚举
            configurable: true//可改变
        });

        // inherit from web3 umbrella package
        if (args[0] && args[0]._requestManager) {
            pkg._requestManager = new requestManager.Manager(args[0].currentProvider);

        // set requestmanager on package
        } else {
            pkg._requestManager = new requestManager.Manager();
            pkg._requestManager.setProvider(args[0], args[1]);
        }

        // add givenProvider
        pkg.givenProvider = requestManager.Manager.givenProvider;
        pkg.providers = requestManager.Manager.providers;

         pkg._provider =  pkg._requestManager.provider;

        // add SETPROVIDER function (don't overwrite if already existing)
        if (!pkg.setProvider) {
            pkg.setProvider = function (provider, net) {
                pkg._requestManager.setProvider(provider, net);
                pkg._provider = pkg._requestManager.provider;
                return true;
            };
        }
    },
    addProviders: function (pkg) {
        pkg.givenProvider = requestManager.Manager.givenProvider;
        pkg.providers = requestManager.Manager.providers;
    }
};

