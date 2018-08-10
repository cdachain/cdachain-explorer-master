let Czr = require("../index");
let czr = new Czr();

let account = 'czr_1eza1dmwq5yjngrxc5fhp8rmzj45t96nca9guyakwh3ywt1n6soymnp1ffr7';
/* czr.request.accountBalance(account).then(function (val) {
    //czr.utils.fromWei(val, "czr");
    console.log(val, czr.utils.fromWei(val.balance, "czr"));
    return val
}) */
/*.then(function (val) {
    czr.request.blockList(account,20).then(function (val) {
        console.log(val)
    })
})*/

let tempBlock=[
    '01590D2C6DC480329C7C83D026C23CD7AF27BCDCE13201EA79A119B1A20FA381'
];
 czr.request.getBlock(tempBlock[0]).then(function (val) {
    //czr.utils.fromWei(val, "czr");
    console.log("getBlock", val);
    return val
})

let tran = {
    from:"czr_3pyhsyadmc3xtofx317kzdup3jnng4wjdgnott4aksua4ktahhonq3wyk93h",
    to:"czr_3h66dopq1b5g6s5fe3g8gzf5mpu4bcckyzqz5k8ramborjwahoa3jaz4ogq6",
    amount:'1',
    password:"12345678",
    data:"",
    id:Math.random()
};
// czr.request.send(tran).then(function (val) {
//     console.log("send", val);
// });

/*
czr.request.blockList("czr_3pyhsyadmc3xtofx317kzdup3jnng4wjdgnott4aksua4ktahhonq3wyk93h",1).then(function (val) {
    console.log("blockList", val);
});*/
