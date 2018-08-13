let Service = require('node-windows').Service;
let path = require('path');
let pathStr=path.join(__dirname, '../database/database.js');
console.log("local:",pathStr);

//浏览器服务
let explorerSvc = new Service({
    name: 'wifisong.canonchain.explorer',    //服务名称
    description: 'CanonChain的浏览器服务', //描述
    // script: 'E:/canonchain-explorer/explorer-backend/bin/www' //nodejs项目要启动的文件路径
    script: pathStr
});

explorerSvc.on('uninstall', function () {
    console.log('wifisong.canonchain.explorer Uninstall Complete.');
    console.log('The service exists: ', explorerSvc.exists);
});
explorerSvc.uninstall();
