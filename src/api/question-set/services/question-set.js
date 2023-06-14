'use strict';

/**
 * question-set service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::question-set.question-set', ({ strapi }) => ({
    findOne(params, populate) {
        console.log(params,'test')
        return strapi.query('api::question-set.question-set').findOne({where:{ id: params.id}, populate: true });
    }
}));
