<template>
    <div class="dash-board-wrap">
        <div class="slogan-wrap">
            <h1 class="slogan">{{slogan}}</h1>
            <p class="slogan-des">{{sloganDes}}</p>
        </div>
        <div class="input-wrap">
            <el-form class="demo-form-inline" @submit.native.prevent="onSubmit">
                <el-input v-model="form.searchVal" :placeholder="form.placeholder" @keydown.enter='onSubmit($event)'>
                    <el-button slot="append" icon="el-icon-search" @click="onSubmit()"></el-button>
                </el-input>
            </el-form>
        </div>
    </div>
</template>
<script>
import Api from "@/api/api";

export default {
    name: "Dashboard",
    data() {
        return {
            slogan: "标准链 区块浏览器",
            sloganDes: "提供交易号和账户的相关查询",
            form: {
                searchVal: "",
                placeholder: "请输入CZR交易号或账户进行查询"
            }
        };
    },
    methods: {
        onSubmit() {
            var currentVal = this.form.searchVal;
            var blockReg = /[A-Z0-9a-z]{64}/;
            // 92CFDBBDA091FE3D12DFCEFB28AAC648277F85278A22253F11A68325314BEAEB

            var accountReg = /^(?:(?:c|C)(?:z|Z)(?:r|R))_([a-zA-Z0-9]{60})/;
            // czr_1wyras8kej7hxua9uirsdhet7tuaghn9nbfwsxdru8w34gk8st5yikstoku3

            if (blockReg.test(currentVal)) {
                //block
                this.$router.push("/block/" + currentVal);
            } else if (accountReg.test(currentVal)) {
                //account
                this.$router.push("/account/" + currentVal);
            } else if (!currentVal) {
                this.$message.error("请输入您要查询的账号或交易号");
            } else {
                this.$message.error("输入值不是合法的账号或交易号，请仔细核对");
            }
        }
    }
};
</script>
<style>
.dash-board-wrap .slogan-wrap {
    margin-top: 60px;
}
.dash-board-wrap .slogan {
    text-shadow: -5px 5px 0 rgba(0, 0, 0, 0.1);
}
@media (max-width: 1199px) {
    .dash-board-wrap .slogan {
        font-size: 34px;
    }
}

@media (min-width: 1200px) {
    .dash-board-wrap .slogan {
        font-size: 56px;
    }
}

.dash-board-wrap .slogan-des {
    font-size: 20px;
    margin-top: 10px;
}
.dash-board-wrap .input-wrap {
    max-width: 680px;
    padding: 0 15px;
    margin: 0 auto;
    margin-top: 60px;
}
</style>
