var pgclient = require('./PG_ALL');// 引用上述文件
pgclient.getConnection();

// var account = {
//     account :"czr_1ozdqi5yzzgm9wwbb58kt86635uygnaxksh4w1nmqo1z6hpxm5cetogpgpqi",
//     type :1,
//     tran_count :2,
//     balance :1234567890.123456789012345678,
// }



// const text = 'INSERT INTO accounts(account,type,tran_count,balance) VALUES($1,$2,$3,$4)'
// const values = [
//     'czr_3b7zjk1uuorkjgsxkyhr6nadm8uba74q1si3himeqasfsotrikfs8xqiwibe', 
//     1,
//     2,
//     "1"
// ]
//RUN=> client.query(INSERT INTO accounts(account,type,tran_count,balance) VALUES($1,$2,$3,$4) , czr_1ozdqi5yzzgm9wwbb58kt86635uygnaxksh4w1nmqo1z6hpxm5cetogpgpqi,1,2,1234567890.1234567 )

// pgclient.query(text,values,(res)=>{
//     console.log("select result",res)
// });
//Select * FROM accounts ORDER BY balance DESC
// pgclient.query("Select * FROM accounts  WHERE account = $1",[ 'czr_1ijwjks3praki6zj18uspsdsoi41zsuwwy3cnts6t5ra7gm6ygxyd7yrudbh' ], (res) => {
//     console.log("select result", res)
// });

//删除 client.query("DELETE FROM test WHERE name=$1", ["xiaoming"])})
// pgclient.query("DELETE FROM accounts  WHERE account = $1",[ 'czr_1ozdqi5yzzgm9wwbb58kt86635uygnaxksh4w1nmqo1z6hpxm5cetogpgpqi' ], (res) => {
//     console.log("select result", res)
// });


var options = {
    "hash": "682C38ACAF122BF6778A7BF7F64D06159C1B4C86149054979327F768E775B5BB",
    "from": "czr_1ijwjks3praki6zj18uspsdsoi41zsuwwy3cnts6t5ra7gm6ygxyd7yrudbh",
    "to": "czr_3b7zjk1uuorkjgsxkyhr6nadm8uba74q1si3himeqasfsotrikfs8xqiwibe",
    "amount": "12.123456789012345678",
    "previous": "FECE5E4638E9ED75B289B38309976E3B0A41731F52ACD98E01B0FB24357CE487",
    "witness_list_block": "3B3913B57AA353BFA4C722EEC259FCCA0028A5D1D4C2D62883A4151D0267A743",
    "last_summary": "1017E898B6D12A1C7C6499B318A237E9FD9D58EF968A9B75BDB47DA6CDCC33DE",
    "last_summary_block": "31F73F3FF1FCFD57417C3F62E27CBD1CDFF5750513F505220AEC51AB422AFFA5",
    "data": "",
    "exec_timestamp": 1530719690,
    "signature": "C4180F34AA45A17AAD15F32AB8FDA04A9200738C84C7A6D8697CF73C1D9A33F6594EB61BA7880B3D5FD0005491AC1F655A5AE612AC76B18FDEFC270DB7DF690D",
    "is_free": false,
    "level": 1840,
    "witnessed_level": 1833,
    "best_parent": "E337E4AB80F2E7BC8634D1F7B3339DE4EB35C855D6D35DDC9517987A7991B185",
    "is_stable": true,
    "is_fork": false,
    "is_invalid": false,
    "is_fail": false,
    "is_on_mc": true,
    "mci": 1810,
    "latest_included_mci": 1809,
    "mc_timestamp": 1530719690
}

const blockText = 'INSERT INTO transaction(hash,"from","to",amount,previous,witness_list_block,last_summary,last_summary_block,data,exec_timestamp,signature,is_free,level,witnessed_level,best_parent,is_stable,is_fork,is_invalid,is_fail,is_on_mc,mci,latest_included_mci,mc_timestamp) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)'
const blockValues = [
    "682C38ACAF122BF6778A7BF7F64D06159C1B4C86149054979327F768E775B999",
    "czr_1ijwjks3praki6zj18uspsdsoi41zsuwwy3cnts6t5ra7gm6ygxyd7yrudbh",
    "czr_3b7zjk1uuorkjgsxkyhr6nadm8uba74q1si3himeqasfsotrikfs8xqiwibe",
    "15.123456789012345678",
    "FECE5E4638E9ED75B289B38309976E3B0A41731F52ACD98E01B0FB24357CE487",
    "3B3913B57AA353BFA4C722EEC259FCCA0028A5D1D4C2D62883A4151D0267A743",
    "1017E898B6D12A1C7C6499B318A237E9FD9D58EF968A9B75BDB47DA6CDCC33DE",
    "31F73F3FF1FCFD57417C3F62E27CBD1CDFF5750513F505220AEC51AB422AFFA5",
    "",
    1530719789,
    "C4180F34AA45A17AAD15F32AB8FDA04A9200738C84C7A6D8697CF73C1D9A33F6594EB61BA7880B3D5FD0005491AC1F655A5AE612AC76B18FDEFC270DB7DF690D",
    false,
    1840,
    1833,
    "E337E4AB80F2E7BC8634D1F7B3339DE4EB35C855D6D35DDC9517987A7991B185",
    true,
    false,
    false,
    false,
    true,
    1810,
    1809,
    1530719789
]

pgclient.query(blockText,blockValues,(res)=>{
    console.log("select result",res)
});