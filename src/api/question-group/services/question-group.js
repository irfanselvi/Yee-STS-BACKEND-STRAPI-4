'use strict';

/**
 * question-group service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::question-group.question-group', ({ strapi }) => ({
    findOne(params, populate) {
        return strapi.query('api::question-group.question-group').findOne({
            where: {
                id: params?.id
            },
            populate: {
                questionset: true,
                question_sets: true,
                questions: {populate: true},
            }
          });
    },
    findListNo(params,populate){
        return strapi.query('api::question-group.question-group').findOne({
            where: {
                list_no: params.list_no
            },
            populate: true,
          });
    }
}))


