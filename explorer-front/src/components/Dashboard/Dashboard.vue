<template>
    <div class="dash-board-wrap">
      <div class="slogan-wrap">
        <h1 class="slogan">{{slogan}}</h1>
        <p class="slogan-des">{{sloganDes}}</p>
      </div>
      <div class="input-wrap">
          <el-form ref="onSubmit" class="demo-form-inline">
                <el-input v-model="form.searchVal" :placeholder="form.placeholder">
                    <el-button slot="append" icon="el-icon-search" native-type="submit" @click="onSubmit"></el-button>
                </el-input>
        </el-form>


      </div>
    </div>
</template>
<script>
import Api from "@/api/api";

export default {
  name: 'Dashboard',
  data () {
    return {
      slogan: '标准链区块浏览器',
      sloganDes:"提供交易和账户相关的查询功能",
      form: {
            searchVal: '',
            placeholder:"在此输入交易id(txid)、账户id进行查询"
        }
    }
  },
  methods:{
      onSubmit() {
        var isAccount,
            isTxid;
        var api;
        if(this.form.searchVal>10){
            isAccount=true;
        }else{
            isTxid=true;
        }
        
        var AjaxUrl=Api.getAccount(this.form.searchVal);

        this.$axios.get(AjaxUrl)
        .then(function (response) {
            console.log(response.data.data);
        })
        .catch(function (error) {
            console.log(error);
        });
      }
  }
}
</script>
<style>
  .dash-board-wrap .slogan-wrap{    margin-top: 60px;}
  .dash-board-wrap .slogan{
    font-size: 56px;
    text-shadow: -5px 5px 0 rgba(0,0,0,.1);
  }
  .dash-board-wrap .slogan-des{
    font-size: 20px;
    margin-top: 10px;
  }
  .dash-board-wrap .input-wrap{
    width: 680px;
    margin: 0 auto;
    margin-top: 60px;
  }
</style>
