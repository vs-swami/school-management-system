"use strict";

module.exports = {
  routes: [
    {
      method: "GET",
      path: "/fees/applicable",
      handler: "fees.applicable",
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};

