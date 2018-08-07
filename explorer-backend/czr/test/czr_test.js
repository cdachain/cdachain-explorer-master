let Czr = require("../index");
let czr = new Czr();

let account ='czr_1eza1dmwq5yjngrxc5fhp8rmzj45t96nca9guyakwh3ywt1n6soymnp1ffr7';
czr.request.accountBalance(account).then(function (val) {
    //czr.utils.fromWei(val, "czr");
    console.log(val,czr.utils.fromWei(val.balance, "czr"));
    return val
})
    /*.then(function (val) {
        czr.request.blockList(account,20).then(function (val) {
            console.log(val)
        })
    })*/

czr.request.getBlock("5CE3FF08053C2A4B00A2E79E536A39CB9BC8E75C9FC568083183EAFC0648F4BB").then(function (val) {
    //czr.utils.fromWei(val, "czr");
    console.log("getBlock",val);
    return val
})