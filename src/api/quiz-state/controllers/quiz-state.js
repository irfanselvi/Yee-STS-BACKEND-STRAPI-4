'use strict';

/**
 * quiz-state controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::quiz-state.quiz-state', ({ strapi }) => ({
    async find(ctx) {
        let entities;

        if (ctx.query._q) {
            entities = await strapi.query('api::quiz-state.quiz-state').search(ctx.query);
        } else {
            entities = await strapi.query('api::quiz-state.quiz-state').find(ctx.query);
        }

        const list = entities.map(entity => ({
            id: entity.id,
            start: entity.start,
            end: entity.end
        }));

        // return list.map(entity =>
        //     sanitizeEntity(entity, {model: strapi.models['quiz-state']})
        // );

        return sanitize.contentAPI.output(list);
    },

    async findOne(ctx) {
        const entity = await strapi.services['api::quiz-state.quiz-state'].findOne(ctx.params);

        let quiz = [];
        let user = [];

        if (entity.quiz) {
            quiz = {
                id: entity.quiz.id,
                title: entity.quiz.title,
                description: entity.quiz.description,
                startDate: entity.quiz.startDate,
                endDate: entity.quiz.endDate,
                time: entity.quiz.time,
            }
        }

        if (entity.user) {
           user = {
               id: entity.user.id,
               username: entity.user.username,
               email: entity.user.email,
               role: entity.user.role,
               confirmed: entity.user.confirmed,
               blocked: entity.user.blocked,
           }
        }

        const quiz_state = {
            id: entity.id,
            start: entity.start,
            end: entity.end,
            quiz,
            user
        }

        // return sanitizeEntity(quiz_state, { model: strapi.models['quiz-state'] });
        return sanitize.contentAPI.output(quiz_state);
    },

    async create(ctx) {
        let entity;
        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            entity = await strapi.entityService.create('api::quiz-state.quiz-state', {data: data}, {files});
            // entity = await strapi.services['quiz-state'].create(data, { files });
        } else {
            entity = await strapi.entityService.create('api::quiz-state.quiz-state', {data: ctx.request.body});
            // entity = await strapi.services['quiz-state'].create(ctx.request.body);
        }
        const quiz = entity.quiz.id;
        const user = entity.user.id;
        const quiz_state = {
            id: entity.id,
            quiz: quiz,
            user: user,
            start: entity.start,
            end: entity.end
        }
        // return sanitizeEntity(quiz_state, { model: strapi.models['quiz-state'] });
        return sanitize.contentAPI.output(quiz_state);
    },

    async update(ctx) {
        let entity;
        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            entity = await strapi.entityService.update('api::quiz-state.quiz-state',ctx.params, {data:data}, {files});
            // entity = await strapi.services['quiz-state'].update(ctx.params, data, {files,});
        } else {
            entity = await strapi.entityService.update('api::quiz-state.quiz-state',ctx.params, {data:ctx.request.body});
            // entity = await strapi.services['quiz-state'].update(ctx.params,ctx.request.body);
        }
        const quiz = entity.quiz.id;
        const user = entity.user.id;
        const quiz_state = {
            id: entity.id,
            quiz: quiz,
            user: user,
            start: entity.start,
            end: entity.end
        }

        // return sanitizeEntity(quiz_state, { model: strapi.models['quiz-state'] });
        return sanitize.contentAPI.output(quiz_state);
    },

    async delete(ctx) {
        const entity = await strapi.entityService.delete('api::quiz-state.quiz-state',ctx.params);
        // const entity = await strapi.services['quiz-state'].delete(ctx.params);

        const quiz_state = {
            id: entity.id,
            start: entity.start,
            end: entity.end
        }

        // return sanitizeEntity(quiz_state, { model: strapi.models['quiz-state'] });
        return sanitize.contentAPI.output(quiz_state);
    }
}))
