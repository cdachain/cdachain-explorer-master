import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/components/Home/Home'
import Block from '@/components/Block/Block'
import Account from '@/components/Account/Account'
import NotFound from '@/components/NotFound/NotFound'

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
      name: 'Account',
      component: Account
    },
    { 
      path: '*', 
      component: NotFound
    }
  ]
})
