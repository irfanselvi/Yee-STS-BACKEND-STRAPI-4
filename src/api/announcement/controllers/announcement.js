'use strict';

const { sanitize } = require('@strapi/utils');

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::announcement.announcement', ({ strapi }) => ({
    async find(ctx) {
        let entities;
        if (ctx.query._q) {
            entities = await strapi.services.announcement.search(ctx.query);
        } else {
            // entities = await strapi.query('api::announcement.announcement').findMany({ where :{}, _sort: 'createdOn:desc' , populate: true}});
            entities = await strapi.db.query('api::announcement.announcement').findMany({
                where: { ...ctx.query },
                orderBy: { createdOn: 'DESC' },
                populate: true
            });
        }
        let announcement = entities.map(entity => ({
            id: entity.id,
            title: entity.title,
            description: entity.description,
            createdOn: entity.createdOn,
            createdAt: entity.createdAt,
            documents: entity.documents
        }));

        // return announcement.map(entity => sanitize.contentAPI.output(entity));

        return sanitize.contentAPI.output(announcement)
        // const sanitizedEntity = await sanitize.contentAPI.output(entity);

        // return { data: sanitizedEntity };
    }
}));




