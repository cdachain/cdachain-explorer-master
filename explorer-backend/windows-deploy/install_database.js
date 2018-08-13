let Service = require('node-windows').Service;
let path = require('path');
let pathStr=path.join(__dirname, '../database/database.js');
console.log("local:",pathStr);
//数据库服务
let databaseSvc = new Service({
    name: 'wifisong.canonchain.explorer.database',    //服务名称
    description: 'CanonChain的浏览器的数据支撑服务', //描述
    // script: 'E:/canonchain-explorer/explorer-backend/database/database.js' //nodejs项目要启动的文件路径
    script: pathStr //nodejs项目要启动的文件路径
});

databaseSvc.on('install', () => {
    console.log("wifisong.canonchain.explorer.database' Install Success")
    databaseSvc.start();
});
databaseSvc.install();