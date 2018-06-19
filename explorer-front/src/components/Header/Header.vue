<template>
    <div id="header">
      <div class="container b-flex b-flex-justify">
        <a class="logo-wrap" href="/">
          <img src="@/assets/logo.png" alt="logo" class="czr-logo">
        </a>
        <div class="header-right">
          <ul>
            <li><p class="about-czr" @click="dialogVisible = true">关于</p></li>
          </ul>
        </div>
      </div>

      <el-dialog
        title="关于标准链"
        :visible.sync="dialogVisible"
        :modal='true'
        :append-to-body="true"
        width="40%">
        <span>
          <div class="about-czr-area">
            <div class="czr-des">
              标准链将从通讯的协议层，芯片层出发，为整个区块链行业提供健壮的基石。追求普惠性与相对公平性是标准链所追求的目标。
            </div>
          </div>
        </span>
      </el-dialog>

    </div>
</template>

<script>
  export default {
    data() {
      return {
        dialogVisible: false,
        tableData: []
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
  .about-czr-area{
    /* margin-top: 20px; */
  }
</style>
