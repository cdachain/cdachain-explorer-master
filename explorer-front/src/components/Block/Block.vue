<template>
    <div class="page-block">
        <header-cps></header-cps>
        <div class="block-info-wrap">
            <div class="container">
                <div class="bui-dlist">
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">blockHash
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockHash}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">from
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.from}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">to
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.to}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">amount
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.amount}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">previous
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.previous}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">parents
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.parents}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">best_parent
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.best_parent}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">data
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.data || '-'}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">exec_timestamp
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.exec_timestamp}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">is_fail
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.is_fail}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">is_fork
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.is_fork}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">is_free
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.is_free}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">is_invalid
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.is_invalid}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">is_on_mc
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.is_on_mc}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">is_stable
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.is_stable}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">last_summary
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.last_summary}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">last_summary_block
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.last_summary_block}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">latest_included_mci
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.latest_included_mci}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">level
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.level}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">mc_timestamp
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.mc_timestamp}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">mci
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.mci}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">signature
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.signature}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">witness_list
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.witness_list || '-'}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">witness_list_block
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.witness_list_block}}</div>
                    </div>
                    <div class="block-item-des">
                        <strong class="bui-dlist-tit">witnessed_level
                            <span class="space-des"></span>
                        </strong>
                        <div class="bui-dlist-det">{{blockInfo.witnessed_level}}</div>
                    </div>
                </div>
            </div>

        </div>

    </div>
</template>

<script>
import HeaderCps from "@/components/Header/Header";
export default {
    name: "Block",
    components: {
        HeaderCps
    },
    data() {
        return {
            blockHash: this.$route.params.id,
            blockInfo: {
                from: "-",
                to: "-",
                amount: "0",
                previous: "-",
                parents: "-",
                best_parent: "-",
                data: "",
                exec_timestamp: "-",
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
                    } else {
                        self.$message.error(data.error);
                    }
                });
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
    padding-bottom: 50px;
}
.block-item-des {
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

.bui-dlist-tit .space-des {
    display: inline-block;
    width: 10px;
}
</style>