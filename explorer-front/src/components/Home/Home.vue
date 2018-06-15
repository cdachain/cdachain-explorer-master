<template>
<div class="page-home">
    <header-cps></header-cps>
    <div class="slogan-wrap">
      <h1 class="slogan">{{slogan}}</h1>
      <p class="slogan-des">{{sloganDes}}</p>
    </div>
    <div class="input-wrap">
      <el-input v-model="searchVal" placeholder="请输入内容">
        <el-button slot="append" icon="el-icon-search"></el-button>
      </el-input>
    </div>

</div>
</template>

<script>
import HeaderCps from '@/components/Header/Header'
export default {
  name: 'Home',
  components:{
    HeaderCps
  },
  data () {
    return {
      searchVal:"",
      slogan: '标准链区块浏览器',
      sloganDes:"提供交易和账户相关的查询功能"
    }
  }
}
</script>

<style scoped>
  .page-home {
    width: 100%;
    position: fixed;
    top: 0;left: 0;
    text-align: center;
    height: 100%;
    background-image: radial-gradient(50% 158%, #57509E 29%, #353469 93%, #333366 100%);
  }
  .page-home .slogan-wrap{    margin-top: 60px;}
  .page-home .slogan{
    font-size: 56px;
    text-shadow: -5px 5px 0 rgba(0,0,0,.1);
  }
  .page-home .slogan-des{
    font-size: 20px;
    margin-top: 10px;
  }
  .page-home .input-wrap{
    width: 680px;
    margin: 0 auto;
    margin-top: 60px;
  }


</style>
