<template>
<div class="page-home">
    <header-cps></header-cps>
    <dashboard></dashboard>
</div>
</template>

<script>
import HeaderCps from '@/components/Header/Header'
import Dashboard from '@/components/Dashboard/Dashboard'
export default {
  name: 'Home',
  components:{
    HeaderCps,
    Dashboard
  },
  data () {
    return {
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



</style>
