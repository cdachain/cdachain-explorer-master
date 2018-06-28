// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Web3 from './web3/web3'

Vue.use(ElementUI);
Vue.config.productionTip = false
import axios from 'axios'
Vue.prototype.$axios = axios

//web3
let web3;
if (typeof web3 !== 'undefined') {
    // web3 = new Web3(web3.currentProvider);
    web3 = new Web3();
} else {
    // web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    web3 = new Web3();
}
console.log("Web3=>",Web3)
console.log("web3=>",web3)
Vue.web3 = Vue.prototype.$web3 = web3

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
