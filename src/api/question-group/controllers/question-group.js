'use strict';

/**
 * question-group controller
 */
const { sanitize } = require('@strapi/utils');
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::question-group.question-group', ({ strapi }) => ({

    async find(ctx) {
        let entities;

        if (ctx.query._q) {
            entities = await strapi.query('api::question-group.question-group').search(ctx.query);
            // entities = await strapi.services['question-group'].search(ctx.query);
        } else {
            entities = await strapi.query('api::question-group.question-group').find(ctx.query);
            // entities = await strapi.services['question-group'].find(ctx.query);
        }

        const list = entities.map(entity => ({
            id: entity.id,
            title: entity.title,
            description: entity.description,
            questiontext: entity.questiontext,
            audio: entity.audio,
            type: entity.type,
            skill: entity.skill
        }));

        // return list.map(entity =>
        //     sanitizeEntity(entity, {model: strapi.models['question-group']})
        // );
        return sanitize.contentAPI.output(list);
    },

    async findOne(ctx) {
        const entity = await strapi.query('api::question-group.question-group').findOne({where: { id: ctx.params.id}, populate: true});
        // const entity = await strapi.query('api::question-group.question-group').search(ctx.params);
        // const entity = await strapi.services['question-group'].findOne(ctx.params);

        let questions = [];
        let question_sets = [];

        if (entity.questions.length > 0) {
            questions = entity.questions.map(entity => ({
                id: entity.id,
                type: entity.type,
                question: entity.question,
                a: entity.a,
                b: entity.b,
                c: entity.c,
                d: entity.d,
                e: entity.e,
                answer: entity.answer,
                score: entity.score
            }));
        }

        if (entity.question_sets.length > 0) {
            question_sets = entity.question_sets.map(entity => ({
                id: entity.id,
                title: entity.title,
                description: entity.description
            }));
        }

        const question_group = {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            audio: entity.audio,
            type: entity.type,
            skill: entity.skill,
            quiz: entity.quiz,
            listeningCount: entity.listeningCount,
            questiontext: entity.questiontext,
            question_set: entity.question_set,
            question_sets,
            questions
        }

        // strapi.services['question-group'].update({id: question_group.id}, {
        //     questionCount: questions.length
        // });

        strapi.entityService.update('api::question-group.question-group', question_group.id, {data: {questionCount: questions.length}});

        

        return sanitize.contentAPI.output(question_group);
        // return sanitizeEntity(question_group, { model: strapi.models['question-group'] });
    },

    async createcustom(ctx) {
        let entity;
        let entityQuestion;

        if (ctx.is('multipart')) {
            const { data } = ctx.request.body;
            const parsedData = JSON.parse(data);
            const files = ctx.request.files;

            // const { data, files } = parseMultipartData(ctx);
            if (parsedData.questions) {
                // const { data } = ctx.request.body;
           
                const dataQuestionGroup = {
                    title: parsedData.title,
                    description: parsedData.description,
                    questiontext: parsedData.questiontext,
                    questionCount: parsedData.questions ? parsedData.questions.length : 0,
                    listeningCount: parsedData.listeningCount,
                    type: parsedData.type,
                    skill: parsedData.skill
                }
                entity = await strapi.entityService.create('api::question-group.question-group', {data: dataQuestionGroup});

                await strapi.plugins.upload.services.upload.upload({
                    data: {
                        refId: entity.id,
                        ref: 'api::question-group.question-group',
                        field: 'audio',
                    }, 
                    files: {
                        path: files['files.audio'].path, 
                        name: files['files.audio'].name,
                        type: files['files.audio'].type, // mime type of the file
                        size: files['files.audio'].size,
                        },
                    });
                // entity = await strapi.services['question-group'].create(dataQuestionGroup, {files});

                for (let i = 0; i < parsedData.questions.length; i++) {
                    const question = {
                        question: parsedData.questions[i].question,
                        type: parsedData.questions[i].type,
                        answer: parsedData.questions[i].answer,
                        a: parsedData.questions[i].a,
                        b: parsedData.questions[i].b,
                        c: parsedData.questions[i].c,
                        d: parsedData.questions[i].d,
                        e: parsedData.questions[i].e,
                        question_group: entity.id,
                        score: parsedData.questions[i].score,
                    }
                    entityQuestion = await strapi.entityService.create('api::question.question', {data: question});
                    // entityQuestion = await strapi.services['question'].create(question);
                }
            } else {
                entityQuestion = await strapi.entityService.create('api::question-group.question-group', {data: parsedData});
                // entity = await strapi.services['question-group'].create(data, {files,});

                await strapi.plugins.upload.services.upload.upload({
                    data: {
                        refId: entityQuestion.id,
                        ref: 'api::question-group.question-group',
                        field: 'audio',
                    }, 
                    files: {
                        path: files['files.audio'].path, 
                        name: files['files.audio'].name,
                        type: files['files.audio'].type, // mime type of the file
                        size: files['files.audio'].size,
                        },
                    });
            }
        } else {
            if (ctx.request.body.questions) {
                const data = {
                    title: ctx.request.body.title,
                    description: ctx.request.body.description,
                    questiontext: ctx.request.body.questiontext,
                    questionCount: data.questions ? data.questions.length : 0,
                    listeningCount: ctx.request.body.listeningCount,
                    type: ctx.request.body.type,
                    skill: ctx.request.body.skill
                }
                entity = await strapi.entityService.create('api::question-group.question-group', {data: data});
                // entity = await strapi.services['question-group'].create(data);

                for (let i = 0; i < ctx.request.body.questions.length; i++) {
                    const question = {
                        question: ctx.request.body.questions[i].question,
                        type: ctx.request.body.questions[i].type,
                        answer: ctx.request.body.questions[i].answer,
                        a: ctx.request.body.questions[i].a,
                        b: ctx.request.body.questions[i].b,
                        c: ctx.request.body.questions[i].c,
                        d: ctx.request.body.questions[i].d,
                        e: ctx.request.body.questions[i].e,
                        question_group: entity.id,
                        score: ctx.request.body.questions[i].score
                    }
                    entityQuestion = await strapi.entityService.create('api::question-group.question-group', {data: question});
                    // entityQuestion = await strapi.services['question'].create(question);
                }
            } else {
                entity = await strapi.entityService.create('api::question-group.question-group', {data: ctx.request.body});
                // entity = await strapi.services['question-group'].create(ctx.request.body);
            }
        }

        const question_group = {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            questiontext: entity.questiontext,
            listeningCount: entity.listeningCount,
            audio: entity.audio
        }
        return sanitize.contentAPI.output(question_group);
        // return sanitizeEntity(question_group, { model: strapi.models['question-group'] });
    },

    async updatecustom(ctx) {
        let entity;
        let entityQuestion;

        if (ctx.is('multipart')) {
            const { data } = ctx.request.body;
            const parsedData = JSON.parse(data);
            const files = ctx.request.files;
            // console.log(ctx.params.id)
            // const { data, files } = parseMultipartData(ctx);

            if (parsedData.questions) {
                const dataQuestionGroup = {
                    title: parsedData.title,
                    description: parsedData.description,
                    questiontext: parsedData.questiontext,
                    questionCount: parsedData.questions ? parsedData.questions.length : 0,
                    listeningCount: parsedData.listeningCount,
                    type: parsedData.type,
                    skill: parsedData.skill
                }

                entity = await strapi.entityService.update('api::question-group.question-group', ctx.params.id, {data: dataQuestionGroup});
                // entity = await strapi.services['question-group'].update(ctx.params, dataQuestionGroup, {files});

                if (files['files.audio']){
                await strapi.plugins.upload.services.upload.upload({
                    data: {
                        refId: entity.id,
                        ref: 'api::question-group.question-group',
                        field: 'audio',
                    }, 
                    files: {
                        path: files['files.audio'].path, 
                        name: files['files.audio'].name,
                        type: files['files.audio'].type, // mime type of the file
                        size: files['files.audio'].size,
                        },
                    });
                }

                for (let i = 0; i < parsedData.questions.length; i++) {

                    if (!parsedData.questions[i].id) {
                        const q = {
                            question: parsedData.questions[i].question,
                            type: parsedData.questions[i].type,
                            answer: parsedData.questions[i].answer,
                            // answers: null,
                            a: parsedData.questions[i].a,
                            b: parsedData.questions[i].b,
                            c: parsedData.questions[i].c,
                            d: parsedData.questions[i].d,
                            e: parsedData.questions[i].e,
                            score: parsedData.questions[i].score,
                            question_group: entity.id,
                        }
                        console.log(q);
                        entityQuestion = await strapi.entityService.create('api::question.question',{data: q});
                        // entityQuestion = await strapi.services['question'].create(q);
                    } else {

                        let d = {
                            question: parsedData.questions[i].question,
                            type: parsedData.questions[i].type,
                            answer: parsedData.questions[i].answer,
                            a: parsedData.questions[i].a,
                            b: parsedData.questions[i].b,
                            c: parsedData.questions[i].c,
                            d: parsedData.questions[i].d,
                            e: parsedData.questions[i].e,
                            score: parsedData.questions[i].score,
                        }

                        await strapi.entityService.update('api::question.question', parsedData.questions[i].id, {data: d});
                        // await strapi.services['question'].update({id:data.questions[i].id} , d);
                    }
                }
            } else {
                entity = await strapi.entityService.update('api::question-group.question-group', ctx.params.id, {data: parsedData});
                if (files['files.audio']){
                await strapi.plugins.upload.services.upload.upload({
                    data: {
                        refId: entity.id,
                        ref: 'api::question-group.question-group',
                        field: 'audio',
                    }, 
                    files: {
                        path: files['files.audio'].path, 
                        name: files['files.audio'].name,
                        type: files['files.audio'].type, // mime type of the file
                        size: files['files.audio'].size,
                        },
                    });
                }
                // entity = await strapi.services['question-group'].update(ctx.params, data, {files,});
            }
        } else {
            if (ctx.request.body.questions) {
                const data = {
                    title: ctx.request.body.title,
                    description: ctx.request.body.description,
                    questiontext: ctx.request.body.questiontext,
                    questionCount: ctx.request.body.questions ? ctx.request.body.questions.length : 0,
                    listeningCount: ctx.request.body.listeningCount
                }
                entity = await strapi.entityService.update('api::question-group.question-group', ctx.params, {data: data});
                // entity = await strapi.services['question-group'].update(ctx.params, data);
                for (let i = 0; i < ctx.request.body.questions.length; i++) {
                    if (!data.questions[i].id){
                        const q = {
                            question: ctx.request.body.questions[i].question,
                            type: ctx.request.body.questions[i].type,
                            answer: ctx.request.body.questions[i].answer,
                            a: ctx.request.body.questions[i].a,
                            b: ctx.request.body.questions[i].b,
                            c: ctx.request.body.questions[i].c,
                            d: ctx.request.body.questions[i].d,
                            e: ctx.request.body.questions[i].e,
                            score: ctx.request.body.questions[i].score,
                            question_group: entity.id,
                        }
                        entityQuestion = await strapi.entityService.create('api::question.question', {data: q});
                        // entityQuestion = await strapi.services['question'].create(q);
                    }else {
                        let d = {
                            question: ctx.request.body.questions[i].question,
                            type: ctx.request.body.questions[i].type,
                            answer: ctx.request.body.questions[i].answer,
                            a: ctx.request.body.questions[i].a,
                            b: ctx.request.body.questions[i].b,
                            c: ctx.request.body.questions[i].c,
                            d: ctx.request.body.questions[i].d,
                            e: ctx.request.body.questions[i].e,
                            score: ctx.request.body.questions[i].score,
                        }
                        await strapi.entityService.update('api::question.question', ctx.request.body.questions[i].id, {data: d});
                        // await strapi.services['question'].update({id:ctx.request.body.questions[i].id} , d);
                    }
                }
            } else {

                entity = await strapi.entityService.update('api::question-group.question-group', ctx.params.id, {data: ctx.request.body});
                // entity = await strapi.services['question-group'].update(ctx.params,ctx.request.body);
            }
        }

        const question_group = {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            questiontext: entity.questiontext,
            questionCount: entity.questionCount,
            listeningCount: entity.listeningCount,
            audio: entity.audio
        }

        return sanitize.contentAPI.output(question_group);
        // return sanitizeEntity(question_group, { model: strapi.models['question-group'] });
    },

    async deletecustom(ctx) {
        
        const entity = await strapi.query('api::question-group.question-group').findOne({where: {id: ctx.params.id}, populate: true});
        console.log(entity)
        // const entity = await strapi.services['question-group'].findOne(ctx.params);
        if (entity.question_sets.length) {
            for (let i = 0; i < entity.question_sets.length; i++) {
                const id = entity.question_sets[i].id
                // console.log(entity.question_sets[i])
                const questionSet = await strapi.query('api::question-set.question-set').findOne({where: {id:id}, populate: true});
                // const questionSet = await strapi.services['question-set'].findOne({id});
                if (questionSet.quizzes.length) {
                    const question_group = {
                        status: false,
                        message: 'Bu soru grubu sınavda kullanıldığı için silinemez.',
                        data: {
                            id: entity.id,
                            title: entity.title,
                            description: entity.description,
                            questiontext: entity.questiontext,
                            audio: entity.audio
                        }
                    };
                    return sanitize.contentAPI.output(question_group);
                    // return sanitizeEntity(question_group, {model: strapi.models['question-group']});
                }
            }
            const deletedEntity = await strapi.entityService.delete('api::question-group.question-group', ctx.params.id);
            // const deletedEntity = await strapi.services['question-group'].delete(ctx.params);
            const question_group = {
                status: true,
                message: 'Soru grubu başarıyla silinmiştir.',
                data: {
                    id: deletedEntity.id,
                    title: deletedEntity.title,
                    description: deletedEntity.description,
                    questiontext: deletedEntity.questiontext,
                    audio: deletedEntity.audio
                }
            };
            return sanitize.contentAPI.output(question_group);
            // return sanitizeEntity(question_group, {model: strapi.models['question-group']});
        } else {
            const deletedEntity = await strapi.entityService.delete('api::question-group.question-group', ctx.params.id);
            // const deletedEntity = await strapi.services['question-group'].delete(ctx.params);
            const question_group = {
                status: true,
                message: 'Soru grubu başarıyla silinmiştir.',
                data: {
                    id: deletedEntity.id,
                    title: deletedEntity.title,
                    description: deletedEntity.description,
                    questiontext: deletedEntity.questiontext,
                    audio: deletedEntity.audio
                }
            };
            return sanitize.contentAPI.output(question_group);
            // return sanitizeEntity(question_group, {model: strapi.models['question-group']});
        }
    },

    async list(ctx) {

        const limit = parseInt(ctx.query._limit) || 100;
        const start = parseInt(ctx.query._start) || 0;

        // entities = await strapi.query('question-group').find({ startDate_lte: now, endDate_gte: now, _sort: 'startDate:asc', title_containsi: ctx.query.title, _limit: limit, _start: start });
        

        const entities = await strapi.query('api::question-group.question-group').findMany( {
            where: {
                $and: [
                    {
                       title: { $containsi: ctx.query.title },
                    },
                  ],
              },
              offset: start, 
              limit: limit,
              orderBy: { createdAt: 'desc' },
              populate: true,
        });

        const count = await strapi.query('api::question-group.question-group').count({
            where: {
                $and: [
                    {
                        title: { $containsi: ctx.query.title},
                    }
                ]
            },
            offset: start, 
            limit: limit,
        })

        // const entities = await strapi.services['question-group'].find({ title_containsi: ctx.query.title, _limit: limit, _start: start,_sort: 'createdAt:desc'});
        // const count = await strapi.query('question-group').count({ title_containsi: ctx.query.title, _limit: limit, _start: start});

        let entity = [];
        let list = [];
        for (let i = 0; i < entities.length; i++) {
            entity = {
                id: entities[i].id,
                title: entities[i].title,
                description: entities[i].description,
                questionCount: entities[i].questions.length,
                audio: entities[i].audio,
                status: entities[i].question_sets.length > 0 ? true : false,
                createdAt: entities[i].createdAt
            }
            list.push(entity);
        }

        const datas = {
            data: list,
            page: Math.ceil(count / limit),
            count,
            limit,
            pageNumber: Math.ceil(start / limit) + 1,
        };

        return sanitize.contentAPI.output(datas);
    }


}))
