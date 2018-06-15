<template>
    <div id="header">
      <div class="container b-flex b-flex-justify">
        <a class="logo-wrap">
          <img src="@/assets/logo.png" alt="logo" class="czr-logo">
        </a>
        <div class="header-right">
          <ul>
            <li><p class="about-czr" @click="dialogVisible = true">关于</p></li>
          </ul>
        </div>
      </div>

      <el-dialog
        title="关于区块浏览器"
        :visible.sync="dialogVisible"
        :modal='true'
        :append-to-body="true"
        width="30%">
        <span>这是CZR的区块浏览器说明，哈哈哈哈哈哈</span>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>

    </div>
</template>

<script>
  export default {
    data() {
      return {
        dialogVisible: false
      };
    }
  };
</script>

<style>
  .czr-logo{height: 60px;}
  .about-czr{
    font-size: 16px;
    color: #CDCDCD;
    text-align: center;
    cursor: pointer;
    height: 60px;line-height: 60px;
  }
</style>
