'use strict';

/**
 * answer service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::answer.answer', ({ strapi }) => ({
    async findQU(params, populate) {
        return await strapi.query('api::answer.answer').findOne({ where: { $and: [{ user: params.user }, { quiz: params.quiz }, { question: params.question }] } });
    },
    async findUserAnswers(params, populate) {


        return await strapi.query('api::answer.answer').findMany({ where: { $and: [{ user: params.user }, { quiz: params.quiz }] }, populate: true });
    },

}))
