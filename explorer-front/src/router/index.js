import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home/Home'
import Block from '@/components/Block/Block'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/block/:id',
      name: 'Block',
      component: Block
    },
    {
      path: '/account/:id',
      name: 'Block',
      component: Block
    }
  ]
})
