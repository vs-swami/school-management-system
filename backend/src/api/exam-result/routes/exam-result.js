'use strict';

/**
 * exam-result router - Core Router Approach (More Reliable)
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::exam-result.exam-result');