// var errors = require('web3-core-helpers').errors;
var XHR2 = require('xhr2'); // jshint ignore: line

/**
 * HttpProvider should be used to send rpc calls over http
 */
var HttpProvider = function HttpProvider(host, timeout, headers) {
    this.host = host || 'http://localhost:8545';
    this.timeout = timeout || 0;
    this.connected = false;
    this.headers = headers;
};

HttpProvider.prototype._prepareRequest = function(){
    var request = new XHR2();

    request.open('POST', this.host, true);
    request.setRequestHeader('Content-Type','application/json');

    if(this.headers) {
        this.headers.forEach(function(header) {
            request.setRequestHeader(header.name, header.value);
        });
    }

    return request;
};

/**
 * Should be used to make async request
 *
 * @method send
 * @param {Object} payload
 * @param {Function} callback triggered on end with (err, result)
 */
HttpProvider.prototype.send = function (payload, callback) {
    var _this = this;
    var request = this._prepareRequest();


    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.timeout !== 1) {
            var result = request.responseText;
            var error = null;

            try {
                result = JSON.parse(result);
            } catch(e) {
                // error = errors.InvalidResponse(request.responseText);
            }

            _this.connected = true;
            callback(error, result);
        }
    };

    request.ontimeout = function() {
        _this.connected = false;
        // callback(errors.ConnectionTimeout(this.timeout));
    };

    try {
        request.send(JSON.stringify(payload));
    } catch(error) {
        this.connected = false;
        // callback(errors.InvalidConnection(this.host));
    }
};


module.exports = HttpProvider;
