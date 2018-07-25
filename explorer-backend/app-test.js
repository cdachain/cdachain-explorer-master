//加载express模块
var express = require('express');
//加载body-parser，用来处理post提交过来的数据
var bodyParser = require('body-parser');
//创建app应用 => NodeJS Http.createServer();
var app = express();

app.all('/api', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By",' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    next();
});

//设置静态文件托管
//当用户访问的url以/public开始，那么直接返回对应__dirname + '/public'下的文件
app.use('/public', express.static(__dirname + '/public'));

//bodyparser设置
app.use(bodyParser.urlencoded({ extended: true }));

/*
* 设置API
* */
var indexRouter = require('./routes/index');
app.use('/', indexRouter);
app.use('/api', require('./routes/api'));

app.listen(3000);