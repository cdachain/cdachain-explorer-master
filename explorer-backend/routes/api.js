var express = require("express");
var router = express.Router();

var pgclient = require('../database/PG');// 引用上述文件
pgclient.getConnection();

//写日志
let log4js = require('../database/log_config');
let logger = log4js.getLogger('read_database');//此处使用category的值

var responseData = null;
router.use(function (req, res, next) {
    responseData = {
        code: 200,
        success: true,
        message: "success"
    }
    next();
})

var formatUnits = function (unitsAry) {
    var nodesTempAry = [];
    var tempInfo;
    var tempStatus;
    unitsAry.forEach(function (item) {
        // hash,pkid,is_stable,is_fork,is_invalid,is_fail,is_on_mc
        if (item.is_stable) {
            if (item.is_fork || item.is_invalid) {
                tempStatus = "temp-bad";
            } else {
                if (item.is_fail) {
                    tempStatus = 'final-bad'
                } else {
                    tempStatus = 'good'
                }
            }
        } else {
            tempStatus = 'good'
        }
        tempInfo = {
            "data": {
                "unit": item.hash,
                "unit_s": item.hash.substring(0, 7) + "..."
            },
            "pkid": Number(item.pkid),
            "is_on_main_chain": Number(item.is_on_mc),
            "is_stable": Number(item.is_stable),
            "sequence": tempStatus
        }
        nodesTempAry.push(tempInfo);
    })
    return nodesTempAry;
};

// http://localhost:3000/api/get_accounts
// 获取账号列表
router.get("/get_accounts", function (req, res, next) {
    var queryPage = req.query.page;// ?page=2
    var page, //当前页数
        pages, // 合计总页数
        count; //总条数

    var OFFSETVAL;//前面忽略的条数
    var LIMITVAL = 20;//每页显示条数
    if (typeof Number(queryPage) !== "number") {
        page = 1;
    } else {
        page = Number(queryPage) || 1;
    }
    pgclient.query("Select COUNT(1) FROM accounts", (count) => {
        let typeCountVal = Object.prototype.toString.call(count);
        if (typeCountVal === '[object Error]') {
            responseData = {
                accounts: [],
                page: 1,
                count: 0,
                code: 500,
                success: false,
                message: "count accounts Error"
            }
            res.json(responseData);
        } else {
            count = Number(count[0].count);//TODO 这么写有BUG  Cannot read property 'count' of undefined
            pages = Math.ceil(count / LIMITVAL);
            //paga 不大于 pages
            page = Math.min(pages, page);
            //page 不小于 1
            page = Math.max(page, 1);
            OFFSETVAL = (page - 1) * LIMITVAL;
            // *,balance/sum(balance) 
            pgclient.query("Select account,balance FROM accounts ORDER BY balance DESC LIMIT $1 OFFSET $2", [LIMITVAL, OFFSETVAL], (data) => {
                //改造数据 排名 , 金额，占比
                let typeVal = Object.prototype.toString.call(data);
                if (typeVal === '[object Error]') {
                    responseData = {
                        accounts: [],
                        page: 1,
                        count: 0,
                        code: 404,
                        success: false,
                        message: "no account found"
                    }
                } else {
                    var basePage = Number(queryPage) - 1; // 1 2
                    var accounts = data;
                    accounts.forEach((element, index) => {
                        //占比 element.balance / 1618033988
                        element.proportion = ((element.balance / (1600000000 * 1000000000000000000)) * 100).toFixed(10) + " %";
                        //并保留6位精度
                        let tempVal = element.balance
                        var reg = /(\d+(?:\.)?)(\d{0,6})/;
                        var regAry = reg.exec(tempVal);
                        var integer = regAry[1];
                        var decimal = regAry[2];
                        if (decimal) {
                            while (decimal.length < 6) {
                                decimal += "0";
                            }
                        } else {
                            decimal = ".000000"
                        }
                        element.balance = integer + decimal; //TODO Keep 6 decimal places
                        element.rank = LIMITVAL * basePage + (index + 1);
                    });
                    responseData = {
                        accounts: accounts,
                        page: Number(queryPage),
                        count: Number(count),
                        code: 200,
                        success: true,
                        message: "success"
                    }
                }
                res.json(responseData);
            });
        }
    });
})

//获取账号信息
router.get("/get_account", function (req, res, next) {
    var queryAccount = req.query.account;// ?account=2
    pgclient.query("Select account,balance FROM accounts  WHERE account = $1", [queryAccount], (data) => {
        let typeVal = Object.prototype.toString.call(data);
        if (typeVal === '[object Error]') {
            responseData = {
                account: {},
                code: 500,
                success: false,
                message: "Select account,balance FROM accounts Error"
            }
        } else {
            if (data.length === 1) {
                responseData = {
                    account: data[0],
                    code: 200,
                    success: true,
                    message: "success"
                }
            } else {
                responseData = {
                    account: {},
                    code: 404,
                    success: false,
                    message: "no account found"
                }
            }
        }
        res.json(responseData);
    });
})
// Select COUNT(1) FROM transaction WHERE "from" = $1 OR "to"=$1 ORDER BY xxxx  , 

//获取账号的交易列表
router.get("/get_account_list", function (req, res, next) {
    var queryAccount = req.query.account;// ?account=2
    var queryPage = req.query.page;// ?page=2
    var page, //当前页数
        pages, // 合计总页数
        count; //总条数

    var OFFSETVAL;//前面忽略的条数
    var LIMITVAL = 20;//每页显示条数
    if (typeof Number(queryPage) !== "number") {
        page = 1;
    } else {
        page = Number(queryPage) || 1;
    }
    //TODO 筛选To里 不是失败的
    // is_stable === true  and  is_fork === false and is_invalid === false and is_fail === false
    pgclient.query('Select COUNT(1) FROM transaction WHERE "from" = $1 OR "to"=$1', [queryAccount], (count) => {
        let typeCountVal = Object.prototype.toString.call(count);
        if (typeCountVal === '[object Error]') {
            responseData = {
                count: 0,
                tx_list: [],
                code: 500,
                success: false,
                message: "count account Error"
            }
            res.json(responseData);
        } else {
            count = Number(count[0].count);
            if (count === 0) {
                responseData = {
                    count: 0,
                    tx_list: [],
                    code: 404,
                    success: false,
                    message: "account no found"
                }
                res.json(responseData);
            } else {
                pages = Math.ceil(count / LIMITVAL);
                //paga 不大于 pages
                page = Math.min(pages, page);
                //page 不小于 1
                page = Math.max(page, 1);
                OFFSETVAL = (page - 1) * LIMITVAL;
                // *,balance/sum(balance) 
                pgclient.query('Select exec_timestamp,level,hash,"from","to",is_stable,is_fork,is_invalid,is_fail,amount FROM transaction WHERE "from" = $1 OR "to"=$1 ORDER BY pkid DESC LIMIT $2 OFFSET $3', [queryAccount, LIMITVAL, OFFSETVAL], (data) => {
                    let typeVal = Object.prototype.toString.call(data);
                    if (typeVal === '[object Error]') {
                        responseData = {
                            tx_list: [],
                            page: 1,
                            count: 0,
                            code: 500,
                            success: false,
                            message: "Select exec_timestamp,level,hash,from,to,is_stable,is_fork,is_invalid,is_fail,amount FROM transaction Error"
                        }
                        res.json(responseData);
                    } else {
                        responseData = {
                            tx_list: data,
                            page: Number(queryPage),
                            count: Number(count),
                            code: 0,
                            success: true,
                            message: "success"
                        }
                        //是否从此帐号发出
                        responseData.tx_list.forEach(item => {
                            if (item.from == queryAccount) {
                                item.is_from_this_account = true;
                            } else {
                                item.is_from_this_account = false;
                            }
                            //是否转给自己
                            if (item.from == item.to) {
                                item.is_to_self = true;
                            } else {
                                item.is_to_self = false;
                            }
                        })
                        res.json(responseData);
                    }
                });
            }
        }
    });
})

//获取交易列表 TODO 切换查询，避免攻击
router.get("/get_transactions", function (req, res, next) {
    var queryPage = req.query.page;// ?page=2
    var page, //当前页数
        pages, // 合计总页数
        count; //总条数

    var OFFSETVAL;//前面忽略的条数
    var LIMITVAL = 20;//每页显示条数
    if (typeof Number(queryPage) !== "number") {
        page = 1;
    } else {
        page = Number(queryPage) || 1;
    }
    pgclient.query("Select COUNT(1) FROM transaction", (count) => {
        let typeCountVal = Object.prototype.toString.call(count);
        if (typeCountVal === '[object Error]') {
            responseData = {
                count: 0,
                page: 1,
                transactions: [],
                code: 500,
                success: false,
                message: "count transaction Error"
            }
            res.json(responseData);
        } else {
            count = Number(count[0].count);//TODO 这么写有BUG  Cannot read property 'count' of undefined
            if (count === 0) {
                responseData = {
                    count: 0,
                    page: 1,
                    transactions: [],
                    code: 404,
                    success: false,
                    message: "transaction no found"
                }
                res.json(responseData);
            } else {
                pages = Math.ceil(count / LIMITVAL);
                //paga 不大于 pages
                page = Math.min(pages, page);
                //page 不小于 1
                page = Math.max(page, 1);
                OFFSETVAL = (page - 1) * LIMITVAL;
                // *,balance/sum(balance) 
                pgclient.query('Select exec_timestamp,level,hash,"from","to",is_stable,is_fork,is_invalid,is_fail,amount FROM transaction ORDER BY level DESC LIMIT $1  OFFSET $2', [LIMITVAL, OFFSETVAL], (data) => {
                    let typeVal = Object.prototype.toString.call(data);
                    if (typeVal === '[object Error]') {
                        responseData = {
                            count: 0,
                            page: 1,
                            transactions: [],
                            code: 500,
                            success: false,
                            message: 'Select exec_timestamp,level,hash,"from","to",is_stable,is_fork,is_invalid,is_fail,amount FROM transaction Error'
                        }
                    } else {
                        responseData = {
                            count: Number(count),
                            page: Number(queryPage),
                            transactions: data,
                            code: 200,
                            success: true,
                            message: "success"
                        }
                    }

                    res.json(responseData);
                });
            }
        }
    });
})

//获取最新的交易
router.get("/get_latest_transactions", function (req, res, next) {
    pgclient.query('Select exec_timestamp,level,hash,"from","to",is_stable,is_fork,is_invalid,is_fail,amount FROM transaction ORDER BY level DESC LIMIT 10', (data) => {
        let typeVal = Object.prototype.toString.call(data);
        if (typeVal === '[object Error]') {
            responseData = {
                transactions: [],
                code: 500,
                success: false,
                message: 'select exec_timestamp,level,hash,"from","to",is_stable,is_fork,is_invalid,is_fail,amount from transaction error'
            }
        } else {
            responseData = {
                transactions: data,
                code: 200,
                success: true,
                message: "success"
            }
        }
        res.json(responseData);
    });
})

//获取交易号信息
router.get("/get_transaction", function (req, res, next) {
    var queryTransaction = req.query.transaction;// ?account=2
    pgclient.query('Select pkid,hash,"from","to",amount,previous,witness_list_block,last_summary,last_summary_block,data,exec_timestamp,signature,is_free,level,witnessed_level,best_parent,is_stable,is_fork,is_invalid,is_fail,is_on_mc,mci,latest_included_mci,mc_timestamp FROM transaction  WHERE hash = $1', [queryTransaction], (data) => {
        let typeVal = Object.prototype.toString.call(data);
        if (typeVal === '[object Error]') {
            responseData = {
                transaction: {
                    "pkid": "-",
                    "hash": "-",
                    "from": "-",
                    "to": "-",
                    "amount": "0",
                    "previous": "-",
                    "witness_list_block": "-",
                    "last_summary": "-",
                    "last_summary_block": "-",
                    "data": "",
                    "exec_timestamp": "1534146836",
                    "signature": "-",
                    "is_free": false,
                    "level": "0",
                    "witnessed_level": "0",
                    "best_parent": "-",
                    "is_stable": false,
                    "is_fork": false,
                    "is_invalid": false,
                    "is_fail": false,
                    "is_on_mc": false,
                    "mci": "0",
                    "latest_included_mci": "0",
                    "mc_timestamp": "0",
                    "parents": []
                },
                code: 500,
                success: false,
                message: "select items from transaction error"
            }
            res.json(responseData);
        } else {
            if (data.length === 0) {
                responseData = {
                    transaction: {
                        "pkid": "-",
                        "hash": "-",
                        "from": "-",
                        "to": "-",
                        "amount": "0",
                        "previous": "-",
                        "witness_list_block": "-",
                        "last_summary": "-",
                        "last_summary_block": "-",
                        "data": "",
                        "exec_timestamp": "0",
                        "signature": "-",
                        "is_free": false,
                        "level": "0",
                        "witnessed_level": "0",
                        "best_parent": "-",
                        "is_stable": false,
                        "is_fork": false,
                        "is_invalid": false,
                        "is_fail": false,
                        "is_on_mc": false,
                        "mci": "0",
                        "latest_included_mci": "0",
                        "mc_timestamp": "0",
                        "parents": []
                    },
                    code: 404,
                    success: false,
                    message: "select items from transaction no found"
                }
                res.json(responseData);
            } else {
                pgclient.query("Select item,parent FROM parents WHERE item = $1 ORDER BY parents_id DESC", [data[0].hash], function (result) {
                    let resultTypeVal = Object.prototype.toString.call(result);
                    if (resultTypeVal === '[object Error]') {
                        responseData = {
                            transaction: {
                                "pkid": "-",
                                "hash": "-",
                                "from": "-",
                                "to": "-",
                                "amount": "0",
                                "previous": "-",
                                "witness_list_block": "-",
                                "last_summary": "-",
                                "last_summary_block": "-",
                                "data": "",
                                "exec_timestamp": "0",
                                "signature": "-",
                                "is_free": false,
                                "level": "0",
                                "witnessed_level": "0",
                                "best_parent": "-",
                                "is_stable": false,
                                "is_fork": false,
                                "is_invalid": false,
                                "is_fail": false,
                                "is_on_mc": false,
                                "mci": "0",
                                "latest_included_mci": "0",
                                "mc_timestamp": "0",
                                "parents": []
                            },
                            code: 500,
                            success: false,
                            message: "select items from parents error"
                        }
                    } else {
                        let transaction = data[0];
                        transaction.parents = result;
                        responseData = {
                            transaction: transaction,
                            code: 200,
                            success: true,
                            message: "success"
                        }
                    }
                    res.json(responseData);
                });
            }
        }
    });
})

//获取以前的unit
router.get("/get_previous_units", function (req, res, next) {
    var prev_pkid = Number(req.query.prev_pkid);
    var next_pkid = Number(req.query.next_pkid);
    var active_unit = req.query.active_unit;
    var sqlOptions;
    if (next_pkid) {
        //下一个
        sqlOptions = {
            text: "Select hash,pkid,is_stable,is_fork,is_invalid,is_fail,is_on_mc FROM transaction WHERE pkid < $1 ORDER BY pkid DESC limit 100",
            values: [next_pkid]
        }
    } else if (prev_pkid) {
        //上一个
        sqlOptions = {
            text: "Select hash,pkid,is_stable,is_fork,is_invalid,is_fail,is_on_mc FROM transaction WHERE pkid > $1 ORDER BY pkid DESC limit 100",
            values: [prev_pkid]
        }
    } else if (active_unit) {
        //text: "select * from transaction where pkid > ((select pkid from transaction where hash = $1 order by pkid desc limit 1 )-49) order by pkid offset 0 limit 100 "
        sqlOptions = {
            text: "select hash,pkid,is_stable,is_fork,is_invalid,is_fail,is_on_mc from transaction where pkid < ((select pkid from transaction where hash = $1 order by pkid desc limit 1 )+50) order by pkid  desc offset 0 limit 100 ",
            values: [active_unit]
        }
    } else {
        sqlOptions = "Select hash,pkid,is_stable,is_fork,is_invalid,is_fail,is_on_mc FROM transaction ORDER BY pkid DESC limit 100"
    }

    pgclient.query(sqlOptions, (data) => {
        var tempEdges = {};
        //TODO catch
        let typeVal = Object.prototype.toString.call(data);
        if (typeVal === '[object Error]') {
            responseData = {
                units: {
                    nodes: [],
                    edges: {}
                },
                code: 500,
                success: false,
                message: "select xxx,xxx from transaction error"
            }
            res.json(responseData);
        } else {
            let dataAry = [];
            data.forEach(item => {
                dataAry.push("'" + item.hash + "'");
            })
            var dataAryStr = dataAry.join(",");

            pgclient.query("Select item,parent FROM parents WHERE item in (" + dataAryStr + ")" + "or parent in(" + dataAryStr + ")", (result) => {

                let resultTypeVal = Object.prototype.toString.call(result);
                if (resultTypeVal === '[object Error]') {
                    responseData = {
                        units: {
                            nodes: [],
                            edges: {}
                        },
                        code: 500,
                        success: false,
                        message: "Select item,parent FROM parents error"
                    }
                    res.json(responseData);
                }else{
                    result.forEach(resItem => {
                        tempEdges[resItem.item + '_' + resItem.parent] = {
                            "data": {
                                "source": resItem.item,
                                "target": resItem.parent
                            },
                            "best_parent_unit": true
                        }
                    })
                    responseData = {
                        units: {
                            nodes: formatUnits(data),
                            edges: tempEdges
                        },
                        code: 200,
                        message: "success"
                    };
                    res.json(responseData);
                }
            })
        }
    });
});

module.exports = router;