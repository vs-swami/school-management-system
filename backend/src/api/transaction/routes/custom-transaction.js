module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/transactions/fee-payment',
      handler: 'transaction.processFeePayment',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/transactions/daily-collection',
      handler: 'transaction.getDailyCollection',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/transactions/student/:studentId',
      handler: 'transaction.getStudentTransactions',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/transactions/:transactionId/receipt',
      handler: 'transaction.getReceipt',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};