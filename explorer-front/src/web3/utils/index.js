'use strict';
var czrUnit = require('./unit');
var tools = require('./tools');

module.exports = {
    toBN: tools.toBN,
    isBN: tools.isBN,
    isAddress: tools.isAddress,

    fromWei: czrUnit.fromWei,
    toWei: czrUnit.toWei,
    czrToWei: czrUnit.czrToWei,
    unitMap: czrUnit.unitMap,
    getValueOfUnit: czrUnit.getValueOfUnit,
}

