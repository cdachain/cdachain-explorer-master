"use strict";
var version = require('./version.json').version;
var utils = require('./utils');
var Czr = function Czr(request) {
};

Czr.prototype={
    constructor:Czr,
    version:version,
    utils:utils

}

module.exports = Czr;