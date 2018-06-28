// var BigNumber = require('bignumber.js');
// var version = require('../package.json').version;
var utils = require('./utils/index');
var account = require('./account/index');
// var Eth = require('web3-eth');


function Web3(provider) {
    this.version = "version";
    // this.account = "new Eth(this)";
    this.eth = "new Eth(this)";
}

Web3.prototype={
    constructor:Web3,
    utils:utils
}

module.exports = Web3;