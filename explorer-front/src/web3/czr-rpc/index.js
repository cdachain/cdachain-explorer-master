"use strict";
var helpers = require('web3-core-helpers');
var formatter = helpers.formatters;
var utils = require('web3-utils');
var core = require('web3-core');



// ____________________________

var _ = require('underscore');
var Subscriptions = require('web3-core-subscriptions').subscriptions;
var Method = require('web3-core-method');
var Net = require('web3-net');

var Personal = require('web3-eth-personal');
var BaseContract = require('web3-eth-contract');
var Iban = require('web3-eth-iban');
var Accounts = require('web3-eth-accounts');
var abi = require('web3-eth-abi');

var getNetworkType = require('./getNetworkType.js');


var blockCall = function (args) {
    return (_.isString(args[0]) && args[0].indexOf('0x') === 0) ? "eth_getBlockByHash" : "eth_getBlockByNumber";
};

var Eth = function Eth() {
    var _this = this;

    // sets _requestmanager
    core.packageInit(this, arguments);

    // overwrite setProvider
    var setProvider = this.setProvider;
    this.setProvider = function () {
        setProvider.apply(_this, arguments);
        // _this.net.setProvider.apply(_this, arguments);
        // _this.personal.setProvider.apply(_this, arguments);
        _this.accounts.setProvider.apply(_this, arguments);
        // _this.Contract.setProvider(_this.currentProvider, _this.accounts);
    };


    var defaultAccount = null;
    var defaultBlock = 'latest';

    Object.defineProperty(this, 'defaultAccount', {
        get: function () {
            return defaultAccount;
        },
        set: function (val) {
            if(val) {
                defaultAccount = utils.toChecksumAddress(formatter.inputAddressFormatter(val));
            }

            // also set on the Contract object 也设置在合同对象上
            _this.Contract.defaultAccount = defaultAccount;
            _this.personal.defaultAccount = defaultAccount;

            // update defaultBlock
            methods.forEach(function(method) {
                method.defaultAccount = defaultAccount;
            });

            return val;
        },
        enumerable: true
    });
    Object.defineProperty(this, 'defaultBlock', {
        get: function () {
            return defaultBlock;
        },
        set: function (val) {
            defaultBlock = val;
            // also set on the Contract object
            _this.Contract.defaultBlock = defaultBlock;
            _this.personal.defaultBlock = defaultBlock;

            // update defaultBlock
            methods.forEach(function(method) {
                method.defaultBlock = defaultBlock;
            });

            return val;
        },
        enumerable: true
    });


    this.clearSubscriptions = _this._requestManager.clearSubscriptions;

    // add net
    this.net = new Net(this.currentProvider);
    // add chain detection
    this.net.getNetworkType = getNetworkType.bind(this);

    // add accounts
    this.accounts = new Accounts(this.currentProvider);

    // add personal
    this.personal = new Personal(this.currentProvider);
    this.personal.defaultAccount = this.defaultAccount;

    // create a proxy Contract type for this instance, as a Contract's provider
    // is stored as a class member rather than an instance variable. If we do
    // not create this proxy type, changing the provider in one instance of
    // web3-eth would subsequently change the provider for _all_ contract
    // instances!
    var Contract = function Contract() {
        BaseContract.apply(this, arguments);
    };

    Contract.setProvider = function() {
        BaseContract.setProvider.apply(this, arguments);
    };

    // make our proxy Contract inherit from web3-eth-contract so that it has all
    // the right functionality and so that instanceof and friends work properly
    Contract.prototype = Object.create(BaseContract.prototype);
    Contract.prototype.constructor = Contract;

    // add contract
    this.Contract = Contract;
    this.Contract.defaultAccount = this.defaultAccount;
    this.Contract.defaultBlock = this.defaultBlock;
    this.Contract.setProvider(this.currentProvider, this.accounts);

    // add IBAN
    this.Iban = Iban;

    // add ABI
    this.abi = abi;


    var methods = [

        //获取当前gas价格，该价格由最近的若干块 的gas价格中值决定。
        new Method({
            name: 'getGasPrice',
            call: 'eth_gasPrice',
            params: 0,
            outputFormatter: formatter.outputBigNumberFormatter
        }),

        //用来获取指定块中特定账户地址的余额。
        new Method({
            name: 'getBalance',
            call: 'eth_getBalance',
            params: 2,
            inputFormatter: [formatter.inputAddressFormatter, formatter.inputDefaultBlockNumberFormatter],
            outputFormatter: formatter.outputBigNumberFormatter
        }),

        //返回指定块编号或块哈希对应的块
        new Method({
            name: 'getBlock',
            call: blockCall,
            params: 2,
            inputFormatter: [formatter.inputBlockNumberFormatter, function (val) { return !!val; }],
            outputFormatter: formatter.outputBlockFormatter
        }),


        //用来发送已经签名的交易,，可以使用 accounts.signTransaction() 方法进行签名
        new Method({
            name: 'sendSignedTransaction',
            call: 'eth_sendRawTransaction',
            params: 1,
            inputFormatter: [null]
        }),

        //对交易进行签名，用来签名的账户地址需要首先解锁
        new Method({
            name: 'signTransaction',
            call: 'eth_signTransaction',
            params: 1,
            inputFormatter: [formatter.inputTransactionFormatter]
        }),

        //向以太坊网络提交一个交易
        new Method({
            name: 'sendTransaction',
            call: 'eth_sendTransaction',
            params: 1,
            inputFormatter: [formatter.inputTransactionFormatter]
        }),

        //返回具有指定哈希值的交易对象。
        new Method({
            name: 'getTransaction',
            call: 'eth_getTransactionByHash',
            params: 1,
            inputFormatter: [null],
            outputFormatter: formatter.outputTransactionFormatter
        }),

        //可能会用到的 _____________________________________________________________________________
/* 
        //返回节点旳以太坊协议版本。
        new Method({
            name: 'getProtocolVersion',
            call: 'eth_protocolVersion',
            params: 0
        }),
        // 方法用来检查节点当前是否已经与网络同步。
        new Method({
            name: 'isSyncing',
            call: 'eth_syncing',
            params: 0,
            outputFormatter: formatter.outputSyncingFormatter
        }),
        //返回当前节点控制的账户列表。
        new Method({
            name: 'getAccounts',
            call: 'eth_accounts',
            params: 0,
            outputFormatter: utils.toChecksumAddress
        }),
        //返回指定交易的收据对象。 如果交易处于pending状态，则返回null。
        new Method({
            name: 'getTransactionReceipt',
            call: 'eth_getTransactionReceipt',
            params: 1,
            inputFormatter: [null],
            outputFormatter: formatter.outputTransactionReceiptFormatter
        }),
        //指定地址发出的交易数量。
        new Method({
            name: 'getTransactionCount',
            call: 'eth_getTransactionCount',
            params: 2,
            inputFormatter: [formatter.inputAddressFormatter, formatter.inputDefaultBlockNumberFormatter],
            outputFormatter: utils.hexToNumber
        }),

        //估计调用需要耗费的gas量
        new Method({
            name: 'estimateGas',
            call: 'eth_estimateGas',
            params: 1,
            inputFormatter: [formatter.inputCallFormatter],
            outputFormatter: utils.hexToNumber
        }) */
    ];

    methods.forEach(function(method) {
        method.attachToObject(_this);
        method.setRequestManager(_this._requestManager, _this.accounts); // second param means is eth.accounts (necessary for wallet signing)
        method.defaultBlock = _this.defaultBlock;
        method.defaultAccount = _this.defaultAccount;
    });

};

core.addProviders(Eth);


module.exports = Eth;

