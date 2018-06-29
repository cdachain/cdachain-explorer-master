"use strict";
var version = require('./version.json').version;
var utils = require('./utils').default;
var HttpRequest = require('./httprequest').default;

var Czr = function Czr(request) {
    if (request) {
		this._request = request;
	}
    this.request = new HttpRequest(this);
    // this.request = HttpRequest;
};

Czr.prototype={
    constructor:Czr,
    version:version,
    utils:utils,
    setRequest:function(request){
        this._request = request;
        // this.api._setRequest(request);
        // this.admin._setRequest(request);
    }

}

module.exports = Czr;