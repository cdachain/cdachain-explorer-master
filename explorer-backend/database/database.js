let BigNumber = require('bignumber.js').default;

let Czr = require("../czr/index");
let czr = new Czr();

let pgclient = require('./PG');// 引用上述文件
pgclient.getConnection();

//写日志
let log4js = require('./log_config');
let logger = log4js.getLogger('=>');//此处使用category的值

let dbStableMci;//本地数据库的最高稳定MCI
let rpcStableMci;//RPC接口请求到的最高稳定MCI

let cartMci = 0;//大量数据分批存储时候，用来记录MCI
let tempMci;//大量数据分批存储时候，临时MCI
let isStableDone = false;//稳定的MCI是否插入完成

let stableUnitAry;//用来保存稳定tran的数组；
let getRpcTimer = null;


let pageUtility = {
    init() {
        let SearchOptions = {
            text: "select mci from transaction where (is_stable = $1 and is_fork =$2 and is_invalid=$2 and is_fail=$2) order by pkid desc limit 1",
            values: [true, false]
        };
        pgclient.query(SearchOptions, (data) => {
            if (data.length === 0) {
                dbStableMci = 0;
            } else if (data.length === 1) {
                dbStableMci = Number(data[0].mci)+1;
            } else if (data.length > 1) {
                logger.info("get dataCurrentMai is Error");
                return;
            }
            logger.info(`应该使用的稳定MCI-dbStableMci : ${dbStableMci}`);
            pageUtility.readyGetData();
        });
    },
    readyGetData() {
        getRpcTimer = setTimeout(function () {
            pageUtility.getRPC()
        }, 2000)
    },
    getRPC() {
        //获取网络中最新稳定的MCI
        czr.request.status().then(function (status) {
            return status
        }).then(function (status) {
            rpcStableMci = Number(status.status.last_stable_mci);

            if (dbStableMci < rpcStableMci) {
                if ((dbStableMci + 1000) < rpcStableMci) {
                    //数量太多，需要分批插入
                    cartMci = dbStableMci + 1000;
                    isStableDone = false;
                } else {
                    //一次可以插入完
                    isStableDone = true;
                }
                logger.info(`dbStableMci:${dbStableMci} , rpcStableMci:${rpcStableMci}, 开始准备插入数据 ${dbStableMci < rpcStableMci}`);
                pageUtility.startInsertData();
            } else {
                pageUtility.readyGetData();
            }
        })
    },
    startInsertData() {
        stableUnitAry = [];
        //1、查询所有稳定 block 信息
        let getUnitByMci = function () {
            logger.info(`通过稳定MCI值 ${dbStableMci} 获取网络中block信息 BY czr.request.mciBlocks`);
            czr.request.mciBlocks(dbStableMci).then(function (data) {
                data.blocks.forEach((item) => {
                    stableUnitAry.push(item);
                });
                dbStableMci++;//7001

                //当前是否完成，控制一次插入多少
                if (isStableDone) {
                    tempMci = rpcStableMci;
                } else {
                    tempMci = cartMci;
                }

                if (dbStableMci <= tempMci) {
                    getUnitByMci();
                } else {
                    //2、整理稳定并且储存,储存到trans action 表中
                    stableUnitAry.sort(function (a, b) {
                        return Number(a.level) - Number(b.level);
                    });

                    /*pgclient.query('BEGIN', (err) => {
                        //shouldAbort
                        // if (pageUtility.shouldAbort(err)) return;
                        logger.info("批量插入稳定Unit Start", stableUnitAry.length);
                        let accountsTotal = {},
                            parentsTotal = {};
                        stableUnitAry.forEach(blockInfo => {
                            //DO 处理账户
                            //发款方不在当前 accountsTotal 时 （以前已经储存在数据库了）
                            if (!accountsTotal.hasOwnProperty(blockInfo.from)) {
                                accountsTotal[blockInfo.from] = {
                                    account: blockInfo.from,
                                    type: 1,
                                    balance: "0"
                                }
                            }

                            let isFail = pageUtility.isFail(blockInfo);//交易失败了
                            if(!isFail){
                                //处理收款方
                                if (accountsTotal.hasOwnProperty(blockInfo.to)) {
                                    //有：更新数据
                                    accountsTotal[blockInfo.to].balance = BigNumber(accountsTotal[blockInfo.to].balance).plus(blockInfo.amount).toString(10);
                                } else {
                                    //无：写入数据
                                    accountsTotal[blockInfo.to] = {
                                        account: blockInfo.to,
                                        type: 1,
                                        balance: blockInfo.amount
                                    }
                                }
                                //处理发款方
                                if (Number(blockInfo.level) !== 0) {
                                    accountsTotal[blockInfo.from].balance = BigNumber(accountsTotal[blockInfo.from].balance).minus(blockInfo.amount).toString(10);
                                }
                            }

                            //DO 处理 parents 数据
                            if (blockInfo.parents.length > 0) {
                                //当有 parents 时候
                                parentsTotal[blockInfo.hash] = blockInfo.parents;
                            }

                            //DO 批量insertTransSQL
                            pageUtility.insertTransSQL(blockInfo);
                            pageUtility.batchInsertOrUpdateParent(parentsTotal);
                            parentsTotal={};
                        });
                        pgclient.query('COMMIT', (err) => {
                            pageUtility.batchInsertOrUpdateAccount(accountsTotal);

                            logger.info("批量插入稳定Unit End", err, Object.keys(stableUnitAry).length);

                            //Other
                            logger.info(`是否插入不稳定Unit:${isStableDone} dbStableMci:${dbStableMci }, rpcStableMci:${rpcStableMci}, tempMci:${tempMci} isStableDone:${isStableDone}`);
                            if (!isStableDone) {
                                //没有完成,处理 cartMci 和 isDone
                                if ((cartMci + 1000) < rpcStableMci) {
                                    //数量太多，需要分批插入
                                    cartMci += 1000;
                                    isStableDone = false;
                                } else {
                                    //下一次可以插入完
                                    cartMci = rpcStableMci;
                                    isStableDone = true;
                                }
                                stableUnitAry = [];
                                getUnitByMci();
                            } else {
                                //最后：获取 不稳定的unstable_blocks 存储
                                czr.request.unstableBlocks().then(function (data) {
                                    let unstableUnitAry = data.blocks;
                                    //排序 level 由小到大
                                    unstableUnitAry.sort(function (a, b) {
                                        return Number(a.level) - Number(b.level);
                                    });
                                    pgclient.query('BEGIN', (err) => {
                                        logger.info("批量插入不稳定Unit Start", err);
                                        let unstableParentsTotal = {};
                                        unstableUnitAry.forEach(blockInfo => {
                                            //处理 parents 数据
                                            if (blockInfo.parents.length > 0) {
                                                //当有 parents 时候
                                                unstableParentsTotal[blockInfo.hash] = blockInfo.parents;
                                            }
                                            pageUtility.insertTransSQL(blockInfo);
                                            pageUtility.batchInsertOrUpdateParent(unstableParentsTotal);
                                            unstableParentsTotal={};
                                        });
                                        pgclient.query('COMMIT', (err) => {
                                            logger.info("批量插入不稳定Unit End", err);
                                            pageUtility.readyGetData();
                                        })

                                    })
                                })
                            }


                        })
                    });*/


                    // **** 以前的
                    pgclient.query('BEGIN', (err) => {
                        logger.info("批量插入稳定Unit Start", stableUnitAry.length);
                        let accountsTotal = {},
                            parentsTotal = {};
                        try {
                            stableUnitAry.forEach(blockInfo => {
                                //DO 处理账户
                                //发款方不在当前 accountsTotal 时 （以前已经储存在数据库了）
                                if (!accountsTotal.hasOwnProperty(blockInfo.from)) {
                                    accountsTotal[blockInfo.from] = {
                                        account: blockInfo.from,
                                        type: 1,
                                        balance: "0"
                                    }
                                }

                                let isFail = pageUtility.isFail(blockInfo);//交易失败了
                                if(!isFail){
                                    //处理收款方
                                    if (accountsTotal.hasOwnProperty(blockInfo.to)) {
                                        //有：更新数据
                                        accountsTotal[blockInfo.to].balance = BigNumber(accountsTotal[blockInfo.to].balance).plus(blockInfo.amount).toString(10);
                                    } else {
                                        //无：写入数据
                                        accountsTotal[blockInfo.to] = {
                                            account: blockInfo.to,
                                            type: 1,
                                            balance: blockInfo.amount
                                        }
                                    }
                                    //处理发款方
                                    if (Number(blockInfo.level) !== 0) {
                                        accountsTotal[blockInfo.from].balance = BigNumber(accountsTotal[blockInfo.from].balance).minus(blockInfo.amount).toString(10);
                                    }
                                }
                                // else{
                                //     logger.info("失败的Unit Hash ",blockInfo.hash);//当前的交易是失败的
                                // }

                                //DO 处理 parents 数据
                                if (blockInfo.parents.length > 0) {
                                    //当有 parents 时候
                                    parentsTotal[blockInfo.hash] = blockInfo.parents;
                                }

                                //DO 批量insertTransSQL
                                pageUtility.insertTransSQL(blockInfo);
                                pageUtility.batchInsertOrUpdateParent(parentsTotal);
                                parentsTotal={};
                            });
                            pgclient.query('COMMIT', (err) => {
                                pageUtility.batchInsertOrUpdateAccount(accountsTotal);

                                logger.info("批量插入稳定Unit End", err, Object.keys(stableUnitAry).length);

                                //Other
                                logger.info(`是否插入不稳定Unit:${isStableDone} dbStableMci:${dbStableMci }, rpcStableMci:${rpcStableMci}, tempMci:${tempMci} isStableDone:${isStableDone}`);
                                if (!isStableDone) {
                                    //没有完成,处理 cartMci 和 isDone
                                    if ((cartMci + 1000) < rpcStableMci) {
                                        //数量太多，需要分批插入
                                        cartMci += 1000;
                                        isStableDone = false;
                                    } else {
                                        //下一次可以插入完
                                        cartMci = rpcStableMci;
                                        isStableDone = true;
                                    }
                                    stableUnitAry = [];
                                    getUnitByMci();
                                } else {
                                    //最后：获取 不稳定的unstable_blocks 存储
                                    czr.request.unstableBlocks().then(function (data) {
                                        let unstableUnitAry = data.blocks;
                                        //排序 level 由小到大
                                        unstableUnitAry.sort(function (a, b) {
                                            return Number(a.level) - Number(b.level);
                                        });
                                        pgclient.query('BEGIN', (err) => {
                                            logger.info("批量插入不稳定Unit Start", err);
                                            let unstableParentsTotal = {};
                                            try {
                                                unstableUnitAry.forEach(blockInfo => {
                                                    //处理 parents 数据
                                                    if (blockInfo.parents.length > 0) {
                                                        //当有 parents 时候
                                                        unstableParentsTotal[blockInfo.hash] = blockInfo.parents;
                                                    }
                                                    pageUtility.insertTransSQL(blockInfo);
                                                    pageUtility.batchInsertOrUpdateParent(unstableParentsTotal);
                                                    unstableParentsTotal={};
                                                });
                                                pgclient.query('COMMIT', (err) => {
                                                    logger.info("批量插入不稳定Unit End", err);
                                                    pageUtility.readyGetData();
                                                })
                                            } catch (err){
                                                logger.error(`批量插入不稳定Unit 出错了`);
                                                logger.error(err);
                                                pgclient.query('ROLLBACK', (info) => {
                                                    logger.info("批量插入不稳定Unit ROLLBACK");
                                                    logger.error(info);
                                                })
                                            }

                                        })
                                    })
                                }


                            })
                        } catch (err){
                            logger.error(`批量插入稳定Unit try出错了`);
                            logger.error(err);
                            pgclient.query('ROLLBACK', (info) => {
                                logger.info("批量插入稳定Unit ROLLBACK");
                                logger.error(info);
                            })
                        }
                    });


                }
            })
        };
        getUnitByMci();
    },
    insertTransSQL(blockInfo) {
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
            let typeVal = Object.prototype.toString.call(res);
            // if (typeVal == '[object Array]') {
            if (typeVal === '[object Error]') {
                logger.info(`Unit插入失败 ${blockInfo.hash}`);
                logger.error(res);
                logger.info(`Unit开始更新 ${blockInfo.hash} `);
                pageUtility.updateTransTask(blockInfo);
            }else{
                logger.info(`Unit插入成功 ${blockInfo.hash}`);
            }
        })
    },
    updateTransTask(blockInfo){
        const sqlOptions = {
            text: 'UPDATE transaction SET "from"=$2,"to"=$3,amount=$4,previous=$5,witness_list_block=$6,last_summary=$7,last_summary_block=$8,data=$9,exec_timestamp=$10,signature=$11,is_free=$12,level=$13,witnessed_level=$14,best_parent=$15,is_stable=$16,is_fork=$17,is_invalid=$18,is_fail=$19,is_on_mc=$20,mci=$21,latest_included_mci=$22,mc_timestamp=$23 WHERE hash=$1',
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

        pgclient.query(sqlOptions, (res) => {
            let typeVal = Object.prototype.toString.call(res);
            if (typeVal === '[object Error]') {
                logger.info(`Unit更新失败 ${blockInfo.hash}`);
                logger.error(res);
                logger.info(`再次更新Unit ${blockInfo.hash} `);
                pageUtility.updateTransTask(blockInfo);
            }else{
                logger.info(`Unit更新成功 ${blockInfo.hash} `);
            }
        });
    },
    batchInsertOrUpdateAccount(accountsTotal) {
        for (let account in accountsTotal) {
            pageUtility.addAccountTask(accountsTotal[account])
        }
    },
    batchInsertOrUpdateParent(parentsTotalObj) {
        for (let hash in parentsTotalObj) {
            parentsTotalObj[hash].forEach(parent => {
                //没有则插入 item:hash parent:parent
                pageUtility.insertParentsTask(hash, parent);
            })
        }
    },

    addAccountTask(accountObj) {
        const sqlOptions = {
            text: "INSERT INTO accounts(account,type,balance) VALUES($1,$2,$3)",
            values: [accountObj.account, 1, accountObj.balance]
        };
        pgclient.query(sqlOptions, (res) => {
            let typeVal = Object.prototype.toString.call(res);
            if (typeVal === '[object Error]') {
                logger.info(`Account插入失败 ${accountObj.account}`);
                logger.info(`Account开始更新 ${accountObj.account}`);
                pageUtility.updateAccountTask(accountObj);
            }else{
                logger.info(`Account插入成功 ${accountObj.account}`);
            }
        });
    },
    updateAccountTask(accountObj) {
        //需要先获取金额，然后再进行相加
        pgclient.query("Select * FROM accounts  WHERE account = $1", [accountObj.account], (data) => {
            let currentAccount = data[0];
            let targetBalance = BigNumber(currentAccount.balance).plus(accountObj.balance).toString(10);
            const sqlOptions = {
                text: "UPDATE accounts SET balance=$2 WHERE account=$1",
                values: [accountObj.account, targetBalance]
            };
            pgclient.query(sqlOptions, (res) => {
                let typeVal = Object.prototype.toString.call(res);
                if (typeVal === '[object Error]') {
                    logger.info(`Account更新失败 ${accountObj.account}`);
                    logger.info(res);
                    logger.info(`Account再次更新 ${accountObj.account}`);
                    pageUtility.updateAccountTask(accountObj);
                }else{
                    logger.info(`Account更新成功 ${accountObj.account}`);
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
            let typeVal = Object.prototype.toString.call(res);
            if (typeVal === '[object Error]') {
                logger.info(`Parent插入失败,已经存在了 ${hash} - ${parentHash} `);
                logger.error(res);
                // logger.info(`Parent再次插入 ${hash}`);
                // pageUtility.insertParentsTask(hash, parentHash);
            }else{
                logger.info(`Parent插入成功 ${hash} - ${parentHash}`);
            }
        });
    },

    shouldAbort(err){

        if (err) {
            logger.error('Error in transaction');
            logger.error(err);
            pgclient.query('ROLLBACK', (roll_err) => {
                if (roll_err) {
                    logger.error('Error rolling back client');
                    logger.error(roll_err);
                }
                // release the client back to the pool
                // done()
            })
        }
        return !!err
    },
    isFail(obj) {
        //true 是失败的
        return (obj.is_stable === "1") && ((obj.is_fork === "1") || (obj.is_invalid === "1") || (obj.is_fail === "1"));
    }
};
pageUtility.init();