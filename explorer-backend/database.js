let BigNumber = require('bignumber.js').default;

let Czr = require("./czr");
let czr = new Czr();

let pgclient = require('./PG_ALL');// 引用上述文件
pgclient.getConnection();


let local_stable_mci;
let last_stable_mci;

let shoppingCartMci = 0;//分批次存储时候记录mci
let tempMci;
let isStableDone = false;

let mciBlocksAry;
let getRPCTimer = null;


let pageUtility = {
    startRun() {
        let SearchMciOptions = {
            text: "select mci from transaction where (is_stable = $1 and is_fork =$2 and is_invalid=$2 and is_fail=$2) order by pkid desc limit 1",
            values: [true, false]
        };
        pgclient.query(SearchMciOptions, (data) => {
            if (data.length > 1) {
                console.log("get dataCurrentMai is Error");
                return;
            }
            if (data.length === 0) {
                local_stable_mci = 0;
            } else if (data.length === 1) {
                local_stable_mci = Number(data[0].mci) + 1;
            }
            console.log(`第一次获取到数据库的数据 :${data}, local_stable_mci:${local_stable_mci}`);
            pageUtility.init();
        });

    },
    init() {
        //更新数据
        getRPCTimer = setTimeout(function () {
            pageUtility.getRPC()
        }, 1500)
    },
    getRPC() {
        //获取 status 的 last_stable_mci
        czr.request.status().then(function (status) {
            return status
        }).then(function (status) {
            last_stable_mci = status.status.last_stable_mci;
            console.log(`local_stable_mci:${local_stable_mci} , last_stable_mci:${last_stable_mci} ,是否getMciBlocks : ${local_stable_mci < last_stable_mci}`);

            if (local_stable_mci < last_stable_mci) {
                if ((local_stable_mci + 1000) < last_stable_mci) {
                    //数量太多，需要分批插入
                    shoppingCartMci = local_stable_mci + 1000;
                    isStableDone = false;
                } else {
                    //一次可以插入完
                    isStableDone = true;
                }
                pageUtility.startInsertData();
            } else {
                pageUtility.init();
            }
        })
    },
    startInsertData() {
        mciBlocksAry = [];
        console.log("开始准备插入数据");
        //1、查询所有稳定 block 信息
        var getMciBlocks = function () {
            czr.request.mciBlocks(local_stable_mci).then(function (data) {
                data.blocks.forEach((item) => {
                    mciBlocksAry.push(item);
                });
                local_stable_mci++;

                //当前是否完成，控制一次插入多少
                if (isStableDone) {
                    tempMci = last_stable_mci;
                } else {
                    tempMci = shoppingCartMci;
                }

                if (local_stable_mci <= tempMci) {
                    getMciBlocks();
                } else {
                    //2、整理稳定并且储存,储存到trans action 表中
                    mciBlocksAry.sort(function (a, b) {
                        return Number(a.level) - Number(b.level);
                    });
                    pgclient.query('BEGIN', (err) => {
                        console.log("稳定 BEGIN", mciBlocksAry.length);
                        var accountsTotal = {},
                            parentsTotal = {};
                        mciBlocksAry.forEach(blockInfo => {

                            let isFail = pageUtility.isFail(blockInfo);
                            if (isFail) {
                                console.log("isFail",blockInfo.hash);
                                //改From，不改To的
                                //发款方不在当前 accountsTotal 时 （以前已经储存在数据库了）
                                if (!accountsTotal[blockInfo.from]) {
                                    accountsTotal[blockInfo.from] = {
                                        account: blockInfo.from,
                                        type: 1,
                                        balance: "0",
                                        tran_count: 0,
                                    }
                                }else{
                                    accountsTotal[blockInfo.from].tran_count = accountsTotal[blockInfo.from].tran_count + 1;
                                }
                            } else {
                                /*
                                @ 处理 account 数据，收款方
                                */
                                if (accountsTotal.hasOwnProperty(blockInfo.to)) {
                                    //有：更新数据
                                    accountsTotal[blockInfo.to].balance = BigNumber(accountsTotal[blockInfo.to].balance).plus(blockInfo.amount).toString(10);
                                    accountsTotal[blockInfo.to].tran_count = accountsTotal[blockInfo.to].tran_count + 1;
                                } else {
                                    //无：写入数据
                                    accountsTotal[blockInfo.to] = {
                                        account: blockInfo.to,
                                        type: 1,
                                        balance: blockInfo.amount,
                                        tran_count: 1,
                                    }
                                }
                                //处理 发款方
                                //发款方不在当前 accountsTotal 时 （以前已经储存在数据库了）
                                if (!accountsTotal[blockInfo.from]) {
                                    accountsTotal[blockInfo.from] = {
                                        account: blockInfo.from,
                                        type: 1,
                                        balance: "0",
                                        tran_count: 0,
                                    }
                                }
                                if (blockInfo.from != blockInfo.to) {
                                    //如果不是自己转
                                    accountsTotal[blockInfo.from].balance = BigNumber(accountsTotal[blockInfo.from].balance).minus(blockInfo.amount).toString(10);
                                    accountsTotal[blockInfo.from].tran_count = accountsTotal[blockInfo.from].tran_count + 1;
                                } else {
                                    //如果是自己转给自己
                                    if (blockInfo.level != 0) {
                                        accountsTotal[blockInfo.from].balance = BigNumber(accountsTotal[blockInfo.from].balance).minus(blockInfo.amount).toString(10);
                                    }
                                }
                            }

                            /* 
                            @ 处理 parents 数据
                            */
                            if (blockInfo.parents.length > 0) {
                                //当有 parents 时候
                                parentsTotal[blockInfo.hash] = blockInfo.parents;
                            }

                            /* 
                            @ 批量insertTransSQL
                            */
                            pageUtility.insertTransSQL(blockInfo);

                        });
                        pgclient.query('COMMIT', (err) => {
                            pageUtility.batchInsertOrUpdateAccount(accountsTotal);
                            pageUtility.batchInsertOrUpdateParent(parentsTotal);
                            console.log("稳定 COMMIT", err, Object.keys(parentsTotal).length);

                            //Other
                            console.log("isStableDone", isStableDone);
                            console.log(`local_stable_mci :${local_stable_mci },last_stable_mci:${last_stable_mci},tempMci:${tempMci}`);
                            if (!isStableDone) {
                                //没有完成,处理shoppingCartMci 和 isDone
                                if ((shoppingCartMci + 1000) < last_stable_mci) {
                                    //数量太多，需要分批插入
                                    shoppingCartMci += 1000;
                                    isStableDone = false;
                                } else {
                                    //下一次可以插入完
                                    shoppingCartMci = last_stable_mci;
                                    isStableDone = true;
                                }
                                mciBlocksAry = [];
                                getMciBlocks();
                            } else {
                                //完成了
                                //最后：获取 不稳定的unstable_blocks 存储
                                czr.request.unstableBlocks().then(function (data) {
                                    var unstableBlocksAry = data.blocks;
                                    //排序 level 由小到大
                                    unstableBlocksAry.sort(function (a, b) {
                                        return Number(a.level) - Number(b.level);
                                    });
                                    pgclient.query('BEGIN', (err) => {
                                        console.log("不稳定 BEGIN", err);
                                        var unstableParentsTotal = {};
                                        unstableBlocksAry.forEach(blockInfo => {
                                            /*
                                            @ 处理 parents 数据
                                            */
                                            if (blockInfo.parents.length > 0) {
                                                //当有 parents 时候
                                                unstableParentsTotal[blockInfo.hash] = blockInfo.parents;
                                            }
                                            pageUtility.insertTransSQL(blockInfo);
                                        });
                                        pgclient.query('COMMIT', (err) => {
                                            console.log("不稳定 COMMIT", err);
                                            pageUtility.batchInsertOrUpdateParent(unstableParentsTotal);
                                            // pageUtility.init();
                                        })
                                    })
                                })
                            }


                        })
                    });


                }
            })
        };
        getMciBlocks();
    },
    insertTransSQL(blockInfo) {
        // console.log("插入", blockInfo.hash)
        const addBlockSQL = {
            text: 'INSERT INTO transaction(hash,"from","to",amount,previous,witness_list_block,last_summary,last_summary_block,data,exec_timestamp,signature,is_free,level,witnessed_level,best_parent,is_stable,is_fork,is_invalid,is_fail,is_on_mc,mci,latest_included_mci,mc_timestamp) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)',
            values: [
                blockInfo.hash,
                blockInfo.from,
                blockInfo.to,
                blockInfo.amount,
                blockInfo.previous,
                blockInfo.witness_list_block,
                blockInfo.last_summary,
                blockInfo.last_summary_block,
                blockInfo.data,
                Number(blockInfo.exec_timestamp),
                blockInfo.signature,
                blockInfo.is_free == '1',
                Number(blockInfo.level),
                Number(blockInfo.witnessed_level),
                blockInfo.best_parent,
                blockInfo.is_stable == '1',
                blockInfo.is_fork == '1',
                blockInfo.is_invalid == '1',
                blockInfo.is_fail == '1',
                blockInfo.is_on_mc == '1',
                Number(blockInfo.mci),
                Number(blockInfo.latest_included_mci) || 0,
                Number(blockInfo.mc_timestamp),
            ],
        };
        pgclient.query(addBlockSQL, (res) => {
        })
    },
    batchInsertOrUpdateAccount(accountsTotal) {
        for (account in accountsTotal) {
            // console.log("batchInsertOrUpdateAccount ==> ", account)
            pageUtility.addAccountTask(accountsTotal[account])
        }
    },
    batchInsertOrUpdateParent(parentsTotalObj) {
        //hash:['hax1','hash2']
        for (hash in parentsTotalObj) {
            // console.log("batchInsertOrUpdateParent ==> ", hash,parentsTotalObj[hash])
            parentsTotalObj[hash].forEach(parent => {
                //没有则插入 item:hash parent:parent
                pageUtility.insertParentsTask(hash, parent);
            })
        }
    },
    addAccountTask(accountObj) {
        const sqlOptions = {
            text: "INSERT INTO accounts(account,type,tran_count,balance) VALUES($1,$2,$3,$4)",
            values: [accountObj.account, 1, accountObj.tran_count, accountObj.balance]
        };
        pgclient.query(sqlOptions, (res) => {
            var typeVal = Object.prototype.toString.call(res);
            if (typeVal == '[object Array]') {
                // console.log("addAccountTask", accountObj.account, 'Success')
            } else if (typeVal == '[object Error]') {
                // console.log("addAccountTask", accountObj.account, 'Error,去更新')
                pageUtility.updateAccountTask(accountObj);
            }
        });
    },
    updateAccountTask(accountObj) {
        //TODO 这么写有BUG啊；需要先获取金额，然后再进行相加
        pgclient.query("Select * FROM accounts  WHERE account = $1", [accountObj.account], (data) => {
            let currentAccount = data[0];
            console.log("获取成功啦", currentAccount);
            let targetBalance = BigNumber(currentAccount.balance).plus(accountObj.balance).toString(10);
            let targetTran = BigNumber(currentAccount.tran_count).plus(accountObj.tran_count).toString(10);
            const sqlOptions = {
                text: "UPDATE accounts SET balance=$2,tran_count=$3 WHERE account=$1",
                values: [accountObj.account, targetBalance, targetTran]
            };
            pgclient.query(sqlOptions, (res) => {
                var typeVal = Object.prototype.toString.call(res);
                if (typeVal == '[object Array]') {
                    console.log("updateAccountTask", accountObj.account, 'Success')
                } else if (typeVal == '[object Error]') {
                    console.log("updateAccountTask", accountObj.account, 'Error')
                }
            });
        });


    },
    insertParentsTask(hash, parentHash) {
        const sqlOptions = {
            text: "INSERT INTO parents(item,parent) VALUES($1,$2)",
            values: [hash, parentHash]
        };
        pgclient.query(sqlOptions, (res) => {
            if (res == 'error') {
                console.log("insertParentsTask", res)
            }
        });
    },
    isFail(obj) {
        //true 是失败的
        return (obj.is_stable === "1") && ((obj.is_fork === "1") || (obj.is_invalid === "1") || (obj.is_fail === "1"));
    }
};
pageUtility.startRun();