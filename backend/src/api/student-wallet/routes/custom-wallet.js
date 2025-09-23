module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/student-wallets/student/:studentId',
      handler: 'student-wallet.findByStudent',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/student-wallets/:walletId/topup',
      handler: 'student-wallet.topup',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/student-wallets/:walletId/purchase',
      handler: 'student-wallet.purchase',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/student-wallets/:walletId/transactions',
      handler: 'student-wallet.getTransactions',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/student-wallets/:walletId/statement',
      handler: 'student-wallet.getStatement',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/student-wallets/active',
      handler: 'student-wallet.getAllActive',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/student-wallets/:walletId/balance',
      handler: 'student-wallet.checkBalance',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/student-wallets/bulk-topup',
      handler: 'student-wallet.bulkTopup',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};