'use strict';
const { sanitize } = require('@strapi/utils');
/**
 * question controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::question.question', ({ strapi }) => ({
    async find(ctx) {
        let entities;
        if (ctx.query._q) {
            entities = await strapi.services.question.search(ctx.query);
        } else {
            entities = await strapi.services.question.find(ctx.query);
        }
        let question = entities.map(entity => ({
            id: entity.id,
            question: entity.question,
            answer: entity.answer,
            a: entity.a,
            b: entity.b,
            c: entity.c,
            d: entity.d
        }));

        // return question.map(entity => sanitize.contentAPI.output(entity));

        return sanitize.contentAPI.output(question);
    },

    async findOne(ctx) {
        const { id } = ctx.params;
        const entity = await strapi.services.question.findOne({ id });
        let question_group = {};

        if (entity.question_group) {
            question_group = {
                id: entity.question_group.id,
                question_sets: entity.question_group.question_sets,
                title: entity.question_group.title,
                description: entity.question_group.description,
                quiz: entity.question_group.quiz,
                audio: entity.question_group.audio
            }
        }

        const question = {
            id: entity.id,
            question: entity.question,
            answer: entity.answer,
            a: entity.a,
            b: entity.b,
            c: entity.c,
            d: entity.d,
            e: entity.e,
            question_group: question_group,
        }

        return sanitize.contentAPI.output(entity);
    },

    async creates(ctx) {
        let entity;
        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            entity = await strapi.services.question.create(data, { files });
        } else {
            entity = await strapi.services.question.create(ctx.request.body);
        }

        let ques = {
            id: entity._id,
            question: entity.question,
            answer: entity.answer,
            a: entity.a,
            b: entity.b,
            c: entity.c,
            d: entity.d,
            e: entity.e,
            score: entity.score
        };

        return sanitize.contentAPI.output(ques);
    },

    async update(ctx) {
        let entity;
        if (ctx.is('multipart')) {
            // return sanitize.contentAPI.output(question)
            const { data, files } = sanitize.contentAPI.input(ctx);
            entity = await strapi.services.question.update(ctx.params, data, {
                files,
            });
        } else {
            entity = await strapi.services.question.update(
                ctx.params,
                ctx.request.body
            );
        }
        let question = {
            id: entity._id,
            question: entity.question,
            answer: entity.answer,
            a: entity.a,
            b: entity.b,
            c: entity.c,
            d: entity.d,
            e: entity.e,
            score: entity.score
        }

        return sanitize.contentAPI.output(question);
        // return sanitizeEntity(question, {model: strapi.models.question});
    },

    async delete(ctx) {
        const { id } = ctx.params;
        const entity = await strapi.query('api::question.question').findOne({ where: { id: id }, populate: true });
        if (entity.question_group) {
            const question_groupId = entity.question_group.id
            const questionGroup = await strapi.services['api::question-group.question-group'].findOne({ id: question_groupId });
            if (questionGroup.question_sets.length) {
                for (let i = 0; i < questionGroup.question_sets.length; i++) {
                    const question_setsId  = questionGroup.question_sets[i].id
                    const questionSet = await strapi.services['api::question-set.question-set'].findOne({ id: question_setsId });
                    if (questionSet.quizzes.length) {
                        let question = {
                            status: false,
                            message: 'Bu soru sınavda kullanıldığı için silinemez.',
                            data: {
                                id: entity.id,
                                question: entity.question,
                                answer: entity.answer,
                                a: entity.a,
                                b: entity.b,
                                c: entity.c,
                                d: entity.d,
                                e: entity.e,
                                score: entity.score
                            }
                        };
                        console.log(question)
                        return sanitize.contentAPI.output(question)
                    }
                }
                const deletedEntity = await strapi.entityService.delete('api::question.question', id);
                // const deletedEntity = await strapi.services.question.delete(ctx.params);
                const question = {
                    status: true,
                    message: 'Soru başarıyla silinmiştir.',
                    data: {
                        id: deletedEntity.id,
                        question: deletedEntity.question,
                        answer: deletedEntity.answer,
                        a: deletedEntity.a,
                        b: deletedEntity.b,
                        c: deletedEntity.c,
                        d: deletedEntity.d,
                        e: deletedEntity.e,
                        score: deletedEntity.score
                    }
                };
                return sanitize.contentAPI.output(question)
            } else {
                const deletedEntity = await strapi.entityService.delete('api::question.question', id);
                // const deletedEntity = await strapi.services.question.delete(ctx.params);
                const question = {
                    status: true,
                    message: 'Soru başarıyla silinmiştir.',
                    data: {
                        id: deletedEntity.id,
                        question: deletedEntity.question,
                        answer: deletedEntity.answer,
                        a: deletedEntity.a,
                        b: deletedEntity.b,
                        c: deletedEntity.c,
                        d: deletedEntity.d,
                        e: deletedEntity.e,
                        score: deletedEntity.score
                    }
                };
                return sanitize.contentAPI.output(question)
            }
        } else {
            const deletedEntity = await strapi.entityService.delete('api::question.question', id);
            // const deletedEntity = await strapi.services.question.delete(ctx.params);
            const question = {
                status: true,
                message: 'Soru başarıyla silinmiştir.',
                data: {
                    id: deletedEntity.id,
                    question: deletedEntity.question,
                    answer: deletedEntity.answer,
                    a: deletedEntity.a,
                    b: deletedEntity.b,
                    c: deletedEntity.c,
                    d: deletedEntity.d,
                    e: deletedEntity.e,
                    score: deletedEntity.score
                }
            };
            return sanitize.contentAPI.output(question)
        }
    }
}));
