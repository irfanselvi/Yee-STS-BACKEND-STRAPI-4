'use strict';

/**
 * forgot-pass-token service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::forgot-pass-token.forgot-pass-token');
