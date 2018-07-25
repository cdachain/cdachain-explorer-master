let Czr = require("./czr")
let czr = new Czr();

var pgclient = require('./PG_ALL');// 引用上述文件
pgclient.getConnection();

let local_stable_mci = 0;
let last_stable_mci;//2540
let last_mci;//2554

let pageUtility = {
    init() {
        this.getRPC()
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
                czr.request.mciBlocks(local_stable_mci).then(function (data) {
                    var blockInfo = data.blocks[0];
                    // console.log("mciBlocks",blockInfo);
                    const blockText = 'INSERT INTO transaction(hash,"from","to",amount,previous,witness_list_block,last_summary,last_summary_block,data,exec_timestamp,signature,is_free,level,witnessed_level,best_parent,is_stable,is_fork,is_invalid,is_fail,is_on_mc,mci,latest_included_mci,mc_timestamp) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)';
                    const blockValues = [
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
                    ];
                    pgclient.query(blockText, blockValues, (res) => {
                        console.log("储存transaction", res)
                    });
                    //获取 blocks 开始存储
                    pgclient.query("Select * FROM accounts  WHERE account = $1", [blockInfo.to], (data) => {
                        console.log("/get_account", data.length)
                        if (data.length) {
                            //如果存在更新余额
                            //client.query("UPDATE accounts SET age=$1 WHERE name=$2", [21, "xiaoming"])
                            const updateText = "UPDATE accounts SET type=$2,balance=$3,tran_count=$4, WHERE name=$1";
                            const updateValues = [
                                blockInfo.to,
                                1,
                                9999999,
                                99
                            ]
                            pgclient.query(updateText, updateValues, (res) => {
                                console.log("updateText", res)
                            });

                        } else {
                            //如果不存在新建
                            const accountText = 'INSERT INTO accounts(account,type,tran_count,balance) VALUES($1,$2,$3,$4)'
                            const accountValues = [blockInfo.to, 1, 1, blockInfo.amount]
                            pgclient.query(accountText, accountValues, (res) => {
                                console.log("accountText", res)
                            });
                        }

                    });
                    //TODO 增加account 
                    //更新 from 和 to 的金额
                    local_stable_mci++
                    //last_stable_mci
                    if (local_stable_mci <= -10) {
                        getMciBlocks();
                    } else {
                        //获取unstable_blocks存储
                        // czr.request.unstableBlocks().then(function (data) {
                        //     console.log("unstableBlocks", data);
                        // })
                    }


                })
            }
            getMciBlocks();
        })
    }
}
pageUtility.init();

// czr.request.accountList().then(function(data){
//     console.log("data",data);
// })


/* const blockText = 'INSERT INTO transaction(hash,"from","to",amount,previous,witness_list_block,last_summary,last_summary_block,data,exec_timestamp,signature,is_free,level,witnessed_level,best_parent,is_stable,is_fork,is_invalid,is_fail,is_on_mc,mci,latest_included_mci,mc_timestamp) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)'
const blockValues = [
    blockInfo.hash,
    blockInfo.from,
    blockInfo.to,
    blockInfo.amount,
    blockInfo.previous,
    blockInfo.witness_list_block,
    blockInfo.last_summary,
    blockInfo.last_summary_block,
    blockInfo.data,
    blockInfo.exec_timestamp,
    blockInfo.signature,
    blockInfo.is_free,
    blockInfo.level,
    blockInfo.witnessed_level,
    blockInfo.best_parent,
    blockInfo.is_stable,
    blockInfo.is_fork,
    blockInfo.is_invalid,
    blockInfo.is_fail,
    blockInfo.is_on_mc,
    blockInfo.mci,
    blockInfo.latest_included_mci,
    blockInfo.mc_timestamp,
]
pgclient.query(blockText,blockValues,(res)=>{
    console.log("select result",res)
}); */