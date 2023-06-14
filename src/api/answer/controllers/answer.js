'use strict';
const { sanitize } = require('@strapi/utils');
const mime = require('mime');
/**
 * answer controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::answer.answer', ({ strapi }) => ({
    async find(ctx) {
        let entities;
        if (ctx.query._q) {
            entities = await strapi.services.answer.search(ctx.query);
        }
        else {
            entities = await strapi.services.answer.find({ where: { ...ctx.query } });
        }

        const list = entities.map(entity => ({
            id: entity.id,
            time: entity.time,
            answer: entity.answer
        }));

        // return list.map(entity =>
        //     sanitize.contentAPI.output(entity)
        // );
        return sanitize.contentAPI.output(list)
    },

    async findOne(ctx) {
        const entity = await strapi.query('api::answer.answer').findOne({ where: { ...ctx.params } });

        let question = {};
        let quiz = {};
        let user = {};

        if (entity.question) {
            question = {
                id: entity.question.id,
                answer: entity.question.answer,
                type: entity.question.type,
                question: entity.question.question,
                a: entity.question.a,
                b: entity.question.b,
                c: entity.question.c,
                d: entity.question.d,
                question_group: entity.question.question_group
            }
        }
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

        const answer = {
            id: entity.id,
            time: entity.time,
            answer: entity.answer,
            question,
            quiz,
            user
        }
        return sanitize.contentAPI.output(entity)
    },

    async create(ctx) {
        let entity;
        let par;
        if (ctx.is('multipart')) {
            const { data } = ctx.request.body;
            const parsedData = JSON.parse(data);
            par = {
                quiz: parsedData.quiz.toString(),
                user: ctx.state.user.id.toString(),
                question: parsedData.question.toString()
            }
        } else {
            par = {
                quiz: ctx.request.body.quiz.toString(),
                user: ctx.state.user.id.toString(),
                question: ctx.request.body.question.toString()
            }
        }
        const any_answer = await strapi.services['api::answer.answer'].findQU(par);
        if (any_answer) {
            if (ctx.is('multipart')) {
                // const {data, files} =  sanitize.contentAPI.input(ctx)
                const files = ctx.request.files;
                const answerEntity = await strapi.entityService.update('api::answer.answer', any_answer.id, { data: {} },);
              
                await strapi.plugins.upload.services.upload.upload({
                    data: {
                        refId: answerEntity.id,
                        ref: 'api::answer.answer',
                        field: 'openEndedImage',
                    }, 
                    files: {
                        path: files['files.openEndedImage'].path, 
                        name: files['files.openEndedImage'].name,
                        type: files['files.openEndedImage'].type, // mime type of the file
                        size: files['files.openEndedImage'].size,
                        },
                    });
                const answer = {
                    id: answerEntity.id,
                    time: answerEntity.time,
                    answer: answerEntity.answer,
                    openEndedText: answerEntity.openEndedText
                }
                return sanitize.contentAPI.output(answer);


            } else {
                const data = {
                    id: any_answer.id,
                    time: ctx.request.body.time,
                    answer: ctx.request.body.answer,
                    openEndedText: ctx.request.body.openEndedText
                };

                const entity = await strapi.entityService.update('api::answer.answer', any_answer.id, { data: data });
                const answer = {
                    id: entity.id,
                    time: entity.time,
                    answer: entity.answer,
                    openEndedText: entity.openEndedText
                }

                return sanitize.contentAPI.output(answer)
                // return sanitizeEntity(answer, {model: strapi.models.answer});
            }
        }
        else {
            if (ctx.is('multipart')) {
                const { data } = ctx.request.body;
                const parsedData = JSON.parse(data);
                const files = ctx.request.files;

                // const {data, files} = parseMultipartData(ctx);
                const dt = {
                    user: ctx.state.user.id,
                    quiz: parsedData.quiz,
                    question: parsedData.question,
                    time: parsedData.time,
                    answer: parsedData.answer,
                    openEndedText: parsedData.openEndedText
                }
                entity = await strapi.entityService.create('api::answer.answer', { data: dt });

                await strapi.plugins.upload.services.upload.upload({
                    data: {
                        refId: entity.id,
                        ref: 'api::answer.answer',
                        field: 'openEndedImage',
                    }, 
                    files: {
                        path: files['files.openEndedImage'].path, 
                        name: files['files.openEndedImage'].name,
                        type: files['files.openEndedImage'].type, // mime type of the file
                        size: files['files.openEndedImage'].size,
                        },
                    });
                // const entry = await strapi.entityService.create('api::article.article', {
                //     data: {
                //       title: 'My Article',
                //     },
                //   });
            } else {
                const data = {
                    user: ctx.state.user.id,
                    quiz: ctx.request.body.quiz,
                    question: ctx.request.body.question,
                    time: ctx.request.body.time,
                    answer: ctx.request.body.answer,
                    openEndedText: ctx.request.body.openEndedText
                }
                entity = await strapi.entityService.create('api::answer.answer', { data: data });
            }

            const answer = {
                id: entity.id,
                time: entity.time,
                answer: entity.answer,
                openEndedText: entity.openEndedText
            }
            // console.log(entity)
            return sanitize.contentAPI.output(answer)
            // return sanitizeEntity(answer, {model: strapi.models.answer});
        }
    },

    async createForStudent(ctx) {
        let entity;
        let par;
        let score;

        
        if (ctx.is('multipart')) {
            const { data } = ctx.request.body;
            const parsedData = JSON.parse(data);
            score = parsedData.score ? parsedData.score : null;

            par = {
                quiz: parsedData.quiz.toString(),
                user: parsedData.user.toString(),
                question: parsedData.question.toString()
            }
        } else {
            par = {
                quiz: ctx.request.body.quiz.toString(),
                user: data.user.toString(),
                question: ctx.request.body.question.toString()
            }

            score = ctx.request.body.score ? ctx.request.body.score : null;
        }

        const any_answer = await strapi.services['api::answer.answer'].findQU(par);

        if (any_answer) {
            if (ctx.is('multipart')) {
                const files = ctx.request.files;
                const answerEntity = await strapi.entityService.update('api::answer.answer', any_answer.id, { data: {score: score} });
                if (files?.path) {

                await strapi.plugins.upload.services.upload.upload({
                    data: {
                        refId: answerEntity.id,
                        ref: 'api::answer.answer',
                        field: 'openEndedImage',
                    }, 
                    files: {
                        path: files['files.openEndedImage'].path, 
                        name: files['files.openEndedImage'].name,
                        type: files['files.openEndedImage'].type, // mime type of the file
                        size: files['files.openEndedImage'].size,
                        },
                    });
                }

                const answer = {
                    id: answerEntity.id,
                    time: answerEntity.time,
                    answer: answerEntity.answer,
                    openEndedText: answerEntity.openEndedText,
                    score: answerEntity.score
                }
                
                return sanitize.contentAPI.output(answer);

                // const { data, files } = sanitize.contentAPI.input(ctx)

                // const answerEntity = await strapi.services['api::answer.answer'].update({ id: any_answer.id }, {score: score}, {files});
                // const answerEntity = await strapi.entityService.update('api::answer.answer', any_answer.id, { score: score }, { files });
                // const answer = {
                //     id: answerEntity.id,
                //     time: answerEntity.time,
                //     answer: answerEntity.answer,
                //     openEndedText: answerEntity.openEndedText,
                //     score: answerEntity.score
                // }

                // return sanitize.contentAPI.output(answer)
                // return sanitizeEntity(answer, {model: strapi.models.answer});

            } else {
                const data = {
                    id: any_answer.id,
                    time: ctx.request.body.time,
                    answer: ctx.request.body.answer,
                    openEndedText: ctx.request.body.openEndedText,
                    score: ctx.request.body.score
                };
                const entity = await strapi.entityService.update('api::answer.answer', any_answer.id, { data: data });
                // const entity = await strapi.services['api::answer.answer'].update({ id: any_answer.id }, data);

                const answer = {
                    id: entity.id,
                    time: entity.time,
                    answer: entity.answer,
                    openEndedText: entity.openEndedText,
                    score: entity.score
                }

                return sanitize.contentAPI.output(answer)
                // return sanitizeEntity(answer, {model: strapi.models.answer});
            }
        }
        else {
            if (ctx.is('multipart')) {
                const { data } = ctx.request.body;
                const parsedData = JSON.parse(data);
                const files = ctx.request.files;

                // const {data, files} = parseMultipartData(ctx);
                const dt = {
                    user: ctx.state.user.id,
                    quiz: parsedData.quiz,
                    question: parsedData.question,
                    time: parsedData.time,
                    answer: parsedData.answer,
                    openEndedText: parsedData.openEndedText
                }
                entity = await strapi.entityService.create('api::answer.answer', { data: dt });

                if (files?.path) {
                await strapi.plugins.upload.services.upload.upload({
                    data: {
                        refId: entity.id,
                        ref: 'api::answer.answer',
                        field: 'openEndedImage',
                    }, 
                    files: {
                        path: files['files.openEndedImage'].path, 
                        name: files['files.openEndedImage'].name,
                        type: files['files.openEndedImage'].type, // mime type of the file
                        size: files['files.openEndedImage'].size,
                        },
                    });
                }
                // const { data, files } = sanitize.contentAPI.input(ctx)
                // const dt = {
                //     user: data.user,
                //     quiz: data.quiz,
                //     question: data.question,
                //     time: data.time,
                //     answer: data.answer,
                //     openEndedText: data.openEndedText
                // }
                // entity = await strapi.entityService.create('api::answer.answer', { data: dt }, files);
                // entity = await strapi.services['api::answer.answer'].create(dt, {files});
            } else {
                const data = {
                    user: data.user,
                    quiz: ctx.request.body.quiz,
                    question: ctx.request.body.question,
                    time: ctx.request.body.time,
                    answer: ctx.request.body.answer,
                    openEndedText: ctx.request.body.openEndedText
                }
                entity = await strapi.entityService.create('api::answer.answer', { data: data });
            }

            const answer = {
                id: entity.id,
                time: entity.time,
                answer: entity.answer,
                openEndedText: entity.openEndedText
            }

            return sanitize.contentAPI.output(answer)
            // return sanitizeEntity(answer, {model: strapi.models.answer});
        }
    },

    async update(ctx) {
        let entity;
        if (ctx.is('multipart')) {
            const { data } = ctx.request.body;
            const parsedData = JSON.parse(data);
            const files = ctx.request.files;

            // const {data, files} = parseMultipartData(ctx);
        

      
            entity = await strapi.entityService.update('api::answer.answer', ctx.params, { data: parsedData }, { files });
            await strapi.plugins.upload.services.upload.upload({
                data: {
                    refId: entity.id,
                    ref: 'api::answer.answer',
                    field: 'openEndedImage',
                }, 
                files: {
                    path: files['files.openEndedImage'].path, 
                    name: files['files.openEndedImage'].name,
                    type: files['files.openEndedImage'].type, // mime type of the file
                    size: files['files.openEndedImage'].size,
                    },
                });
            // entity = await strapi.services['api::answer.answer'].update(ctx.params, data, {files});
        }
        else {
            const { data } = ctx.request.body;
            const parsedData = JSON.parse(data);
            const files = ctx.request.files;
            entity = await strapi.entityService.update('api::answer.answer', ctx.params, { data: parsedData });
            // entity = await strapi.services['api::answer.answer'].update(ctx.params, ctx.request.body);
        }

        const answer = {
            id: entity.id,
            time: entity.time,
            answer: entity.answer,
            openEndedText: entity.openEndedText
        }

        return sanitize.contentAPI.output(answer)
        // return sanitizeEntity(answer, {model: strapi.models.answer});
    },

    async openendedimage(ctx) {
        // console.log(strapi.plugins.upload.services)
        // console.log(ctx.params)
        // const file = await strapi.plugins.upload.services.upload.findOne({where: {id: ctx.params.id}});
        const file = await strapi.query('plugin::upload.file').findOne({where :{  id: ctx.params.id} });
        // await strapi.plugins.upload.controllers.upload.destroy(ctx.params);
        return strapi.entityService.delete('plugin::upload.file', ctx.params.id)
    },

    async delete(ctx) {
        const entity = await strapi.entityService.delete('api::answer.answer', ctx.params);
        // const entity = await strapi.services['api::answer.answer'].delete(ctx.params);

        const answer = {
            id: entity.id,
            time: entity.time,
            answer: entity.answer,
            openEndedText: entity.openEndedText
        }

        return sanitize.contentAPI.output(answer)
    }

}));
