var path=require("path");
function getAccount(account){
    if(!account){
        return;
    }
    var targrtApi=path.join('/api/address/',account)
    return targrtApi
}
const Api={
    getAccount:getAccount
}
export default Api