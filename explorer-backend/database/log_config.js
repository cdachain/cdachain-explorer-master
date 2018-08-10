let log4js = require('log4js');
let path = require('path');
// let fs = require('fs');
let basePath = path.resolve(__dirname,'../data_logs/database');
//确定目录是否存在，如果不存在则创建目录
// let confirmPath = function(pathStr) {
//     if(!fs.existsSync(pathStr)){
//         fs.mkdirSync(pathStr);
//         console.log('createPath: ' + pathStr);
//     }
// };
// //创建log的根目录'logs'
// if(basePath){
//     confirmPath(basePath);
// }
log4js.configure({
    appenders: {
        cheese: {
            category:"log",        //logger名称
            type: "dateFile",           //日志类型
            filename: basePath,             //日志输出位置
            alwaysIncludePattern:true,    //是否总是有后缀名
            pattern:'-yyyy-MM-dd-hh.log'   //后缀，每小时创建一个新的日志文件
        }
    },
    categories: {
        default: {
            appenders: ['cheese'],
            level: 'info'
        }
    },
    replaceConsole:true
});

module.exports = log4js;