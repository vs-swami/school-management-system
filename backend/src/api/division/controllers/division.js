'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::division.division', ({ strapi }) => ({
  /**
   * Get comprehensive metrics for divisions (actual class units like Year 9A, Year 9B)
   */
  async getMetrics(ctx) {
    try {
      const { divisionId } = ctx.params;
      const divisionMetricsService = require("../services/division-metrics-simple");

      const metrics = await divisionMetricsService.getMetrics(divisionId || null);

      return ctx.send({
        data: metrics,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error fetching division metrics:", error);
      return ctx.badRequest("Failed to fetch division metrics", {
        error: error.message,
      });
    }
  },

  /**
   * Get year group comparison (e.g., all Year 9 divisions compared)
   */
  async getYearGroupComparison(ctx) {
    try {
      const divisionMetricsService = require("../services/division-metrics-simple");

      const comparison = await divisionMetricsService.getYearGroupComparison();

      return ctx.send({
        data: comparison,
        meta: {
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Error fetching year group comparison:", error);
      return ctx.badRequest("Failed to fetch year group comparison", {
        error: error.message,
      });
    }
  },
}));
