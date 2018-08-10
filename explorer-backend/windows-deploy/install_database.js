let Service = require('node-windows').Service;

//数据库服务
let databaseSvc = new Service({
    name: 'wifisong.canonchain.explorer.database',    //服务名称
    description: 'CanonChain的浏览器的数据支撑服务', //描述
    script: 'E:/canonchain-explorer/explorer-backend/database/database.js' //nodejs项目要启动的文件路径
});

databaseSvc.on('install', () => {
    databaseSvc.start();
    console.log("wifisong.canonchain.explorer.database' Install Success")
});
databaseSvc.install();