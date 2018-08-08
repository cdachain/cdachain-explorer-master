let pgclient = require('./PG');// 引用上述文件
pgclient.getConnection();

//删除 client.query("DELETE FROM test WHERE name=$1", ["xiaoming"])})
pgclient.query("DELETE FROM accounts ", (res) => {
    console.log("select result", res)
});
pgclient.query("DELETE FROM parents ", (res) => {
    console.log("select result", res)
});
pgclient.query("DELETE FROM transaction ", (res) => {
    console.log("select result", res)
});