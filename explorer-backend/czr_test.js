let Czr = require("./czr")
let czr = new Czr();

let account ='czr_1acn7q7qshzn9yeof8act11zpdk7tyug7ao81csia5rakyb5wcs76jdft8sj';
czr.request.accountBalance(account).then(function (val) {
    console.log(val)
    return val
}).then(function (val) {
    czr.request.blockList(account,20).then(function (val) {
        console.log(val)
    })
})