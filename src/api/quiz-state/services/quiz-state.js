'use strict';

/**
 * quiz-state service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::quiz-state.quiz-state', ({ strapi }) => ({
    findOne(params, populate) {
        return strapi.query('api::quiz-state.quiz-state').findOne({ where: {id: params.id }, populate: true});
    },
}))
