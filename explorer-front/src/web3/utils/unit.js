'use strict';
/* 
  TODO 
  ————————————————————————————
  fromWei,
  toWei
  czrToWei
  unitMap
  getValueOfUnit
  ————————————————————————————
*/
var BN = require('bn.js');//bignumber库
var utils = require('./tools');

var unitMap = {
  'none': '0', // eslint-disable-line
  'None': '0', // eslint-disable-line

  'wei': '1', // eslint-disable-line
  'Wei': '1', // eslint-disable-line

  'kwei': '1000', // eslint-disable-line
  'Kwei': '1000', // eslint-disable-line

  'mwei': '1000000', // eslint-disable-line
  'Mwei': '1000000', // eslint-disable-line

  'gwei': '1000000000', // eslint-disable-line
  'Gwei': '1000000000', // eslint-disable-line
  
  'czr': '1000000000000000000', // eslint-disable-line
  'CZR': '1000000000000000000', // eslint-disable-line
};

/**
 * Returns value of unit in Wei
 *
 * @method getValueOfUnit
 * @param {String} unit the unit to convert to, default czr
 * @returns {BigNumber} value of the unit (in Wei)
 * @throws error if the unit is not correct:w
 */
function getValueOfUnit(unitInput) {
  var unit = unitInput ? unitInput.toLowerCase() : 'czr';
  var unitValue = unitMap[unit];
  if (unitValue === undefined) {
    throw new Error('The unit undefined, please use the following units:' + JSON.stringify(unitMap, null, 2));
  }
  return new BN(unitValue, 10);
}


/**
 * Takes a number of wei and converts it to any other czr unit.
 * 需要一些wei并将其转换为任何其他的ether单元。
 * @method fromWei
 * @param {Number|String} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert to, default czr
 * @return {String|Object} When given a BN object it returns one as well, otherwise a number
 */
function fromWei(weiInput, unit) {
  return utils.toBN(weiInput).div(getValueOfUnit(unit));

}

/**
 * Takes a number of a unit and converts it to wei.
 * TODO toWei
 * @method toWei
 * @param {Number|String|BN} number can be a number, number string or a HEX of a decimal
 * @param {String} unit the unit to convert from, default czr
 * @return {String|Object} When given a BN object it returns one as well, otherwise a number
 */
function toWei(number, unit) {
  return utils.toBN(number).mul(getValueOfUnit(unit));
}
function czrToWei(number) {
  return utils.toBN(number).mul(getValueOfUnit('czr'));
}

module.exports = {
  fromWei: fromWei,
  toWei: toWei,
  czrToWei: czrToWei,
  unitMap: unitMap,
  getValueOfUnit: getValueOfUnit,

};