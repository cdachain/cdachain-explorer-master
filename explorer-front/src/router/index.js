import Vue from 'vue'
import Router from 'vue-router'

import Home from '@/components/home'
import Block from '@/components/block'
import Dag from '@/components/dag'
import Account from '@/components/account'
import Accounts from '@/components/accounts'
import Transactions from '@/components/transactions'
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
      path: '/accounts',
      name: 'Accounts',
      component: Accounts
    },
    {
      path: '/transactions',
      name: 'Transactions',
      component: Transactions
    },
    {
      path: '/dag',
      name: 'Dag',
      component: Dag
    },
    {
      path: '/dag/:id',
      name: 'Dag',
      component: Dag
    },
    {
      path: '/dag/:id/*',
      name: 'Dag',
      component: Dag
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
