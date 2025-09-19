"use strict";

module.exports = {
  async applicable(ctx) {
    const student = ctx.query.student;
    if (!student) {
      ctx.throw(400, "Missing required query param: student");
    }

    const periodStart = ctx.query.periodStart || null;
    const periodEnd = ctx.query.periodEnd || null;

    const result = await strapi.service("api::fees.fees").applicable({
      student: Number(student),
      periodStart,
      periodEnd,
    });

    ctx.body = result;
  },
};

