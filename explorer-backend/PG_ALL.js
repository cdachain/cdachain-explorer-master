const { Client } = require('pg')

// 数据库配置
let config = {
    host: '192.168.10.222',
    port: 5432,
    user: "postgres",
    password: "abc123456",
    database: "canonchain_explorer",
    // 扩展属性
    max: 20, // 连接池最大连接数
    idleTimeoutMillis: 3000, // 连接最大空闲时间 3s
}
let client = new Client(config);

let PG = function () {
    console.log("准备数据库连接...");
};
PG.prototype.getConnection = function () {
    client.connect(function (err) {
        if (err) {
            return console.error('数据库链接失败:', err);
        }
        client.query('SELECT NOW() AS "theTime"', function (err, result) {
            if (err) {
                return console.error('error running query', err);
            }
            console.log("数据库连接成功...");
        });
    });
};
PG.prototype.query = function (sqlStr, values, cb) {
    var typeVal = Object.prototype.toString.call(values);
    // console.log(`RUN=> client.query(${sqlStr} , ${values} ) `)
    if (typeVal == "[object Function]") {
        //查
        cb = values;
        client.query(sqlStr,function (err, result) {
            // console.log("result",result) 
            if (err) {
                cb("error");
            } else {
                if (result.rows != undefined) {
                    cb(result.rows);
                } else {
                    cb();
                }
            }
        });
    } else {
        //插入
        client.query(sqlStr,values, function (err, result) {
            // console.log("result",result) 
            if (err) {
                cb("error");
            } else {
                if (result.rows != undefined) {
                    cb(result.rows);
                } else {
                    cb();
                }
            }
        });
    }

};
module.exports = new PG();