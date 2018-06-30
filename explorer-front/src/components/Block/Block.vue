<template>
    <div class="page-block">
        <header-cps></header-cps>
        <div class="block-info-wrap">
            <div class="container">
                <div class="search-wrap">
                    <search></search>
                </div>
                <div class="bui-dlist">
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">交易号
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockHash}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">状态
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">
                            <span v-if="txStatus === -1" class="txt-warning">
                                不稳定
                            </span>
                            <span v-else-if="txStatus === 200" class="txt-success">
                                成功
                            </span>
                            <span v-else-if="txStatus === 300" class="txt-info">
                                作废
                            </span>
                            <span v-else-if="txStatus === 400" class="txt-danger">
                                失败
                            </span>
                            <span v-else class="xt-info">
                                -
                            </span>
                        </div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">发款方
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.from || '-'}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">收款方
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.to || '-'}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">金额
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.amount | toCZRVal}} CZR</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">数据
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.data || '-'}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">发送时间
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.exec_timestamp|toDate}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">主网时间
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.mc_timestamp|toDate}}</div>
                    </div>
                </div>
            </div>

        </div>

    </div>
</template>

<script>
import HeaderCps from "@/components/Header/Header";
import Search from "@/components/Search/Search";

let self = null;

export default {
    name: "Block",
    components: {
        HeaderCps,
        Search
    },
    data() {
        return {
            blockHash: this.$route.params.id,
            txStatus: "-",
            blockInfo: {
                from: "-",
                to: "-",
                amount: "0",
                previous: "-",
                parents: "-",
                best_parent: "-",
                data: "",
                exec_timestamp: "0",
                is_fail: "0",
                is_fork: "0",
                is_free: "0",
                is_invalid: "0",
                is_on_mc: "0",
                is_stable: "0",
                last_summary: "-",
                last_summary_block: "-",
                latest_included_mci: "3",
                level: "4",
                mc_timestamp: "0",
                mci: "4",
                signature: "-",
                witness_list: "",
                witness_list_block: "-",
                witnessed_level: "0"
            }
        };
    },
    created() {
        self = this;
        this.initDatabase();
    },
    methods: {
        initDatabase() {
            var self = this;
            self.$czr.request
                .getBlock(self.blockHash)
                .then(function(data) {
                    return data;
                })
                .then(function(data) {
                    if (!data.error) {
                        self.blockInfo = data;
                        if (self.blockInfo.is_stable == "0") {
                            //不稳定
                            self.txStatus = -1; //不稳定
                        } else if (self.blockInfo.is_stable == "1") {
                            //稳定
                            if (
                                self.blockInfo.is_fork == "1" ||
                                self.blockInfo.is_invalid == "1"
                            ) {
                                self.txStatus = 300; //作废
                                //
                            } else {
                                if (self.blockInfo.is_fail == "1") {
                                    self.txStatus = 400; //失败
                                } else {
                                    self.txStatus = 200; //成功
                                }
                            }
                        }
                    } else {
                        self.$message.error(data.error);
                    }
                })
                .catch(function(err) {
                    console.log("error", err);
                });
        }
    },
    filters: {
        toCZRVal: function(val) {
            let tempVal = self.$czr.utils.fromWei(val, "czr");
            return tempVal; //TODO Keep 4 decimal places
        },
        toDate: function(val) {
            if (val == "0" || !val) {
                return "-";
            }
            let newDate = new Date();
            newDate.setTime(val * 1000);
            let addZero = function(val) {
                return val < 10 ? "0" + val : val;
            };
            return (
                newDate.getFullYear() +
                " / " +
                addZero(newDate.getMonth() + 1) +
                " / " +
                addZero(newDate.getDate()) +
                " " +
                addZero(newDate.getHours()) +
                ":" +
                addZero(newDate.getMinutes()) +
                ":" +
                addZero(newDate.getSeconds())
            );
        }
    }
};
</script>

<style   scoped>
.page-block {
    width: 100%;
    position: relative;
}
#header {
    color: #fff;
    background: #5a59a0;
}

.block-info-wrap {
    position: relative;
    width: 100%;
    margin: 0 auto;
    color: black;
    text-align: left;
    padding-top: 20px;
    padding-bottom: 80px;
}
.block-item-des {
    padding: 10px 0;
    border-bottom: 1px dashed #f6f6f6;
}
@media (max-width: 1199px) {
    .bui-dlist {
        color: #3f3f3f;
        font-size: 16px;
        line-height: 2.4;
    }
    .block-item-des {
        display: -webkit-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: block;
    }
    .bui-dlist-tit {
        display: block;
        width: 100%; /* 默认值, 具体根据视觉可改 */
        margin: 0;
        text-align: left;
    }
    .bui-dlist-det {
        display: block;
        color: #5f5f5f;
        text-align: left;
        margin: 0;
        table-layout: fixed;
        word-break: break-all;
        overflow: hidden;
    }
}

@media (min-width: 1200px) {
    .bui-dlist {
        color: #3f3f3f;
        font-size: 16px;
        line-height: 2.4;
        margin-top: 20px;
        border-top: 1px dashed #f6f6f6;
    }
    .block-item-des {
        display: -webkit-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
    }
    .bui-dlist-tit {
        float: left;
        width: 20%; /* 默认值, 具体根据视觉可改 */
        text-align: right;
        margin: 0;
    }
    .bui-dlist-det {
        float: left;
        color: #5f5f5f;
        width: 80%; /* 默认值，具体根据视觉可改 */
        text-align: left;
        margin: 0;
        table-layout: fixed;
        word-break: break-all;
        overflow: hidden;
    }
}

.txt-warning {
    color: #e6a23c;
}
.txt-info {
    color: #909399;
}
.txt-success {
    color: #67c23a;
}
.txt-danger {
    color: #f56c6c;
}

.bui-dlist-tit .space-des {
    display: inline-block;
    width: 10px;
}
</style>