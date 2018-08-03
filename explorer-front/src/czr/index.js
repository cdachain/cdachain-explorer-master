"use strict";
var version = require('./version.json').version;
var utils = require('./utils').default;

var Czr = function Czr() {};

Czr.prototype={
    constructor:Czr,
    version:version,
    utils:utils
}

module.exports = Czr;