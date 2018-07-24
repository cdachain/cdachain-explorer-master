import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import Czr from './czr'

import VueParticles from 'vue-particles'
Vue.use(VueParticles)

Vue.use(ElementUI);
Vue.config.productionTip = false

let czr = new Czr();
Vue.czr = Vue.prototype.$czr = czr;
Vue.prototype.$axios = axios
// Vue.prototype.$router = router

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
