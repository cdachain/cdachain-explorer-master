var express = require("express");
var router = express.Router();

var pgclient = require('../PG_ALL');// 引用上述文件
pgclient.getConnection();

var responseData = null;
router.use(function (req, res, next) {
    responseData = {
        code: 0,
        message: "success"
    }
    next();
})

var formatUnits = function (unitsAry) {
    var nodesTempAry = [];
    var tempInfo;
    unitsAry.forEach(function (item) {
        tempInfo = {
            "data": {
                "unit": item.hash,
                "unit_s": item.hash.substring(0, 7) + "..."
            },
            "pkid": Number(item.pkid),
            "is_on_main_chain": Number(item.is_on_mc),
            "is_stable": Number(item.is_stable),
            "sequence": "good"
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
        count = count[0].count;
        pages = Math.ceil(count / LIMITVAL);
        //paga 不大于 pages
        page = Math.min(pages, page);
        //page 不小于 1
        page = Math.max(page, 1);
        OFFSETVAL = (page - 1) * LIMITVAL;
        // *,balance/sum(balance) 
        pgclient.query("Select * FROM accounts ORDER BY balance DESC LIMIT " + LIMITVAL + " OFFSET " + OFFSETVAL, (data) => {
            //改造数据 排名 , 金额，占比
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

            responseData.accounts = accounts;
            responseData.page = Number(queryPage);
            responseData.count = Number(count);
            responseData.code = 0;
            responseData.message = "success";
            res.json(responseData);
        });
    });
})

//获取账号信息
router.get("/get_account", function (req, res, next) {
    var queryAccount = req.query.account;// ?account=2
    pgclient.query("Select * FROM accounts  WHERE account = $1", [queryAccount], (data) => {
        // console.log("/get_account", data)
        if (data != "error") {
            responseData.account = data[0];
            responseData.code = 0;
            responseData.message = "success";
            res.json(responseData);
        } else {
            responseData.code = 400;
            responseData.message = "error";
            res.json(responseData);
        }

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
    pgclient.query('Select COUNT(1) FROM transaction WHERE "from" = $1 OR "to"=$1 ', [queryAccount], (count) => {
        count = count[0].count;
        console.log("=>", count)
        pages = Math.ceil(count / LIMITVAL);
        //paga 不大于 pages
        page = Math.min(pages, page);
        //page 不小于 1
        page = Math.max(page, 1);
        OFFSETVAL = (page - 1) * LIMITVAL;
        // *,balance/sum(balance) 
        pgclient.query('Select * FROM transaction WHERE "from" = $1 OR "to"=$1 ORDER BY pkid DESC LIMIT ' + LIMITVAL + " OFFSET " + OFFSETVAL, [queryAccount], (data) => {
            console.log("data", data)
            if (data == 'error') {
                responseData = {
                    tx_list: [],
                    code: 400,
                    message: "error"
                }
                res.json(responseData);
            } else {
                responseData = {
                    tx_list: data,
                    page: Number(queryPage),
                    count: Number(count),
                    code: 0,
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
        count = count[0].count;
        console.log("->", count)
        pages = Math.ceil(count / LIMITVAL);
        //paga 不大于 pages
        page = Math.min(pages, page);
        //page 不小于 1
        page = Math.max(page, 1);
        OFFSETVAL = (page - 1) * LIMITVAL;
        // *,balance/sum(balance) 
        pgclient.query("Select * FROM transaction ORDER BY level DESC LIMIT " + LIMITVAL + " OFFSET " + OFFSETVAL, (data) => {
            //改造数据 排名 , 金额，占比
            var basePage = Number(queryPage) - 1; // 1 2
            var transactions = data;
            transactions.forEach((element, index) => {
                element.rank = LIMITVAL * basePage + (index + 1);
            });

            responseData.transactions = transactions;
            responseData.page = Number(queryPage);
            responseData.count = Number(count);
            responseData.code = 0;
            responseData.message = "success";
            res.json(responseData);
        });
    });
})

//获取交易号信息
router.get("/get_transaction", function (req, res, next) {
    var queryTransaction = req.query.transaction;// ?account=2
    pgclient.query("Select * FROM transaction  WHERE hash = $1", [queryTransaction], (data) => {
        if ((data != "error") && (data.length != 0)) {
            pgclient.query("Select * FROM parents WHERE item = $1 ORDER BY parents_id DESC", [data[0].hash], function (result) {
                responseData.transaction = data[0];
                responseData.transaction.parents = result;
                res.json(responseData);
            });
        } else if (data.length == 0) {
            responseData.code = 404;
            responseData.message = "error";
            res.json(responseData);
        } else {
            responseData.code = 400;
            responseData.message = "error";
            res.json(responseData);
        }
    });
})

//获取以前的unit
router.get("/get_previous_units", function (req, res, next) {
    //Select * FROM transaction WHERE pkid < $1 ORDER BY pkid DESC limit 50
    //Select * FROM parents WHERE item = $1 OR parent=$1 ORDER BY parents_id DESC
    var prev_pkid = Number(req.query.prev_pkid);
    var next_pkid = Number(req.query.next_pkid);
    var active_unit = req.query.active_unit;
    var sqlOptions;
    if (next_pkid) {
        //下一个
        sqlOptions = {
            text: "Select * FROM transaction WHERE pkid < $1 ORDER BY pkid DESC limit 100",
            values: [next_pkid]
        }
    } else if (prev_pkid) {
        //上一个
        sqlOptions = {
            text: "Select * FROM transaction WHERE pkid > $1 ORDER BY pkid DESC limit 100",
            values: [prev_pkid]
        }
    } else if (active_unit) {
        // "(select * from transaction where pkid > (select pkid from transaction where hash = $1 limit 1) limit 60 ) union (select * from transaction where pkid <= (select pkid from transaction where hash = $1 limit 1) limit 60 ) order by pkid desc",
        sqlOptions = {
            text: "select * from transaction where pkid > ((select pkid from transaction where hash = $1 limit 1)-49)  and pkid <((select pkid from transaction where hash = $1 limit 1)+50)  order by pkid desc",
            values: [active_unit]
        }
    } else {
        sqlOptions = "Select * FROM transaction ORDER BY pkid DESC limit 100"
    }


    pgclient.query(sqlOptions, (data) => {
        // pgclient.query("Select * FROM transaction WHERE pkid < $1 ORDER BY pkid DESC limit 20", [pkid], (data) => {
        var tempEdges = {};
        pgclient.query('BEGIN', (err) => {
            // console.log("BEGIN",sqlOptions,data);
            data.forEach(item => {
                pgclient.query("Select * FROM parents WHERE item = $1 OR parent=$1 ORDER BY parents_id DESC", [item.hash], function (result) {
                    //result.forEach is not a function
                    console.log("error Error=>",result.length)

                    if(result!='error'){
                        result.forEach((parentItem) => {
                            tempEdges[parentItem.item + '_' + parentItem.parent] = {
                                "data": {
                                    "source": parentItem.item,
                                    "target": parentItem.parent
                                },
                                "best_parent_unit": true
                            }
                        });
                    }else{
                        console.log("error=>",result)
                    }

                });
            });
            pgclient.query('COMMIT', (err, commitRes) => {
                console.log("COMMIT");
                responseData = {
                    units: {
                        nodes: formatUnits(data),
                        edges: tempEdges
                    },
                    code: 0,
                    message: "success"
                }
                console.log("responseData")
                res.json(responseData);

            });
        });


        // responseData = {
        //     units: {
        //         nodes: formatUnits(data),
        //         edges: tempEdges
        //     },
        //     code: 0,
        //     message: "success"
        // }
        // console.log("responseData")
        // res.json(responseData);

    });
});

module.exports = router;