var BigNumber = require('bignumber.js').default;

let Czr = require("./czr")
let czr = new Czr();

var pgclient = require('./PG_ALL');// 引用上述文件
pgclient.getConnection();

let local_stable_mci = 0;
let last_stable_mci;//2540
let last_mci;//2554


let pageUtility = {
    init() {
        //更新数据
        // const updateAccount = {
        //     text: "UPDATE accounts SET balance=$2,tran_count=$3 WHERE account=$1",
        //     values: [
        //         'czr_1aptm6u579y1gx548hj7nmehtu3jmduxmp9pwm4abxyiartcd5kd4ofw1dyd',
        //         '0',
        //         0
        //     ]
        // }
        // pgclient.query(updateAccount, (res) => {
        //     console.log("updateAccount", res)
        // });

        // const queryAccount = {
        //     text: 'Select * FROM accounts  WHERE account = $1',
        //     values: ['czr_1aptm6u579y1gx548hj7nmehtu3jmduxmp9pwm4abxyiartcd5kd4ofw1dyd'],
        // }
        // pgclient.query(queryAccount, (res) => {
        //     console.log("select result", res)
        // });

        // this.getRPC()
    },
    getRPC() {
        //获取 status 的 last_stable_mci
        czr.request.status().then(function (status) {
            return status
        }).then(function (status) {
            last_stable_mci = status.status.last_stable_mci;
            last_mci = status.status.last_mci;
            console.log("STATUS", last_stable_mci, last_mci);
            var getMciBlocks = function () {
                //1、查询 block 信息
                czr.request.mciBlocks(local_stable_mci).then(function (data) {
                    var blockInfo = data.blocks[0];
                    //2、储存到trans action 表中
                    pageUtility.insertTransSQL(blockInfo)

                    //3、查看block.to账号有没有
                    const hasToAccount = { text: "Select * FROM accounts  WHERE account = $1", values: [blockInfo.to] }
                    pgclient.query(hasToAccount, (data) => {
                        // console.log("是否有ToAccount", data)
                        if (data.length) {
                            /* 
                            如果存在账号 更新余额
                                交易次数+=1
                                金额+=block.amount
                            */
                            const oldAccountInfo = data[0];
                            const updateAccountInfo = {
                                balance: BigNumber(oldAccountInfo.balance).plus(blockInfo.amount).toString(10),
                                tran_count: (oldAccountInfo.tran_count + 1)
                            }
                            const updateAccount = {
                                text: "UPDATE accounts SET balance=$2,tran_count=$3 WHERE account=$1",
                                values: [blockInfo.to, updateAccountInfo.balance, updateAccountInfo.tran_count]
                            }
                            pgclient.query(updateAccount, (res) => {
                                // console.log("updateAccount", res)
                            });

                        } else {
                            //如果不存在 新建account
                            const addAccount = {
                                text: "INSERT INTO accounts(account,type,tran_count,balance) VALUES($1,$2,$3,$4)",
                                values: [blockInfo.to, 1, 1, blockInfo.amount]
                            }
                            pgclient.query(addAccount, (res) => {
                                // console.log("addAccount", res)

                                //4、from账号更新、交易次数+=1 ；金额-=block.amount，特殊处理创世块；
                                if (local_stable_mci != 0) {
                                    //如果不是创世块
                                    const getFromAccount = { text: "Select * FROM accounts  WHERE account = $1", values: [blockInfo.from] }
                                    pgclient.query(getFromAccount, (data) => {
                                        // console.log("data", data);
                                        const fromAccountInfo = data[0];
                                        const updateFromAccountInfo = {
                                            balance: BigNumber(fromAccountInfo.balance).minus(blockInfo.amount).toString(10),
                                            tran_count: (fromAccountInfo.tran_count + 1)
                                        }
                                        const updateFromAccount = {
                                            text: "UPDATE accounts SET balance=$2,tran_count=$3 WHERE account=$1",
                                            values: [blockInfo.to, updateFromAccountInfo.balance, updateFromAccountInfo.tran_count]
                                        }
                                        pgclient.query(updateFromAccount, (res) => {
                                            // console.log("updateFromAccount", res)
                                        });
                                    });
                                }
                            });
                        }
                    });


                    //5、更新 parent 表
                    if (blockInfo.parents.length > 0) {
                        pageUtility.insertParentsSQL(blockInfo)
                    }


                    //TODO 增加account 
                    //更新 from 和 to 的金额
                    local_stable_mci++
                    if (local_stable_mci <= 10) {
                        getMciBlocks();
                    } else {
                        //获取unstable_blocks存储
                        czr.request.unstableBlocks().then(function (data) {
                            var unstableBlocksAry = data.blocks;
                            //排序 level 由小到大
                            unstableBlocksAry.sort(function (a, b) {
                                return Number(a.level) - Number(b.level);
                            });
                            pgclient.query('BEGIN', (err) => {
                                unstableBlocksAry.forEach(blockInfo => {
                                    console.log(blockInfo.level)
                                    pageUtility.insertTransSQL(blockInfo);
                                    pageUtility.insertParentsSQL(blockInfo);
                                })
                                pgclient.query('COMMIT', (err) => {
                                    console.log("COMMIT", err);
                                })
                            })
                        })
                    }


                })
            }
            getMciBlocks();
        })
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
        }
        pgclient.query(addBlockSQL, (res) => {
            console.log("insertTrans => ", res)
        })
    },
    insertParentsSQL(blockInfo) {
        blockInfo.parents.forEach(element => {
            //插入Parent表
            const addParents = {
                text: "INSERT INTO parents(item,parent) VALUES($1,$2)",
                values: [blockInfo.hash, element]
            }
            pgclient.query(addParents, (res) => {
                console.log("addParents", res)
            });
        });
    }
}
pageUtility.init();