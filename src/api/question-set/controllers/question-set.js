'use strict';

/**
 * question-set controller
 */
const { sanitize } = require('@strapi/utils');
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::question-set.question-set', ({ strapi }) => ({
    async find(ctx) {
        let entities;
    
        if (ctx.query._q) {
            entities = await strapi.query('api::question-set.question-set').search(ctx.query);
        } else {
            entities = await strapi.query('api::question-set.question-set').findMany({ where: { ...ctx.query } });
        //     entities = await strapi.query('api::question-set.question-set').find({ 
        //         filters: {
        //             ...ctx.query
        //         },
        //         pagination: {
        //             limit: 1000,
        //         },
        //         sort: 'createdAt:desc',
        // });
        }
        const list = entities.map(entity => ({
            id: entity.id,
            title: entity.title,
            description: entity.description
        }))
    
        // return list.map(entity => sanitizeEntity(entity, {model: strapi.models['question-set']}));

        return sanitize.contentAPI.output(list);
    },
    
    async findOne(ctx) {
        const {id} = ctx.params;
        const limit = parseInt(ctx.query._limit) || 100;
        const start = parseInt(ctx.query._start) || 0;
    
        const isNonAddList = [];
        const questionGroupsId = [];
    
        const entity = await strapi.query('api::question-set.question-set').findOne({where: {id:id}, populate: true});
        // const entity = await strapi.services['question-set'].findOne({id});
    
        for (let j = 0; j < entity.question_groups.length; j++) {
            questionGroupsId.push(entity.question_groups[j].id);
            entity.question_groups[j].isAdded = true;
        }
    
        //id_in:questionGroupsId,
        const allQuestionGroups = await strapi.query('api::question-group.question-group').findMany({
            where: {
                $and:[
                    {title: { $containsi: ctx.query.title}},
                ]
            },
            start: start,
            limit: limit,
            orderBy: { createdAt: 'DESC' },
            populate: true
        });

        const count = await strapi.query('api::question-group.question-group').count({
            where: { 
             $and: [
                {title: {$containsi : ctx.query.title}}
             ],
            },
            start: start,
            limit: limit,
        });

        // const allQuestionGroups = await strapi.services['question-group'].find({title_containsi: ctx.query.title,  _limit: limit, _start: start, _sort: 'createdAt:desc'});
        // const count = await strapi.query('question-group').count({ title_containsi: ctx.query.title, _limit: limit, _start: start});
    
    
    
    
    
        const questionGroups = allQuestionGroups.map(entity => {
            if (questionGroupsId.indexOf(entity.id) === -1) {
                entity.isAdded = false;
                isNonAddList.push(entity);
            }
        });
    
    
    
        const questionGroup = [...entity.question_groups, ...isNonAddList];
    
        const newGroup = questionGroup.map(x => ({
            id: x.id,
            title: x.title,
            description: x.description,
            isAdded: x.isAdded
        }));
    
        const question_set = {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            question_groups: newGroup
        }
    
    
        const datas = {
            data: question_set,
            page: Math.ceil(count / limit),
            count,
            limit,
            pageNumber: Math.ceil(start / limit) + 1,
        };

        return sanitize.contentAPI.output(datas);
    
    },
    /*
    async findOne(ctx) {
        const {id} = ctx.params;
        const entity = await strapi.services['question-set'].findOne({id});
        const allQuestionGroups = await strapi.services['question-group'].find({_limit: 1000, _sort: 'createdAt:desc'});
    
        const isNonAddList = [];
        const questionGroupsId = [];
    
        for (let j = 0; j < entity.question_groups.length; j++) {
            questionGroupsId.push(entity.question_groups[j].id);
            entity.question_groups[j].isAdded = true;
        }
    
        const questionGroups = allQuestionGroups.map(entity => {
            if (questionGroupsId.indexOf(entity.id) === -1) {
                entity.isAdded = false;
    
                isNonAddList.push(entity);
            }
        });
    
    
    
        const questionGroup = [...entity.question_groups, ...isNonAddList];
    
        const newGroup = questionGroup.map(x => ({
            id: x.id,
            title: x.title,
            description: x.description,
            isAdded: x.isAdded
        }));
    
        const question_set = {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            question_groups: newGroup
        }
    
        return sanitizeEntity(question_set, {model: strapi.models['question-set']});
    },
    
    */
    async ekle(ctx) {
        const entities = await strapi.query('api::question-group.question-group').find();
        // const entities = await strapi.services['question-group'].find({});
    
        const question_groups = {
            id: null,
            title: '',
            question_groups: entities.map(entity => ({
                id: entity.id,
                title: entity.title,
                description: entity.description,
                questiontext: entity.questiontext,
                audio: entity.audio,
                isAdded: false
            }))
        }
    
        return sanitize.contentAPI.output(question_groups);
        // return sanitizeEntity(question_groups, {model: strapi.models['question-set']});
    },
    
    async createcustom(ctx) {
        let entity;
        let newEntity;
        const requestQuestionGroup = ctx.request.body.question_groups;
        let entityQuestionGroup = [];
        if (ctx.request.body.id) { //Güncelleme
       
            const id = ctx.request.body.id;
            // const entity = await strapi.services['question-set'].findOne({id});

            for (let i = 0; i < requestQuestionGroup.length; i++) {
                if (requestQuestionGroup[i].isAdded) {
                    entityQuestionGroup.push({
                        id: requestQuestionGroup[i].id
                    });
                }
            }

            if (entityQuestionGroup) {
                const secondData = {
                    title: ctx.request.body.title,
                    description: ctx.request.body.description,
                    question_groups: entityQuestionGroup.map(m => m.id)
                }
                console.log(secondData,'ewqeqweqw')
                newEntity = await strapi.entityService.update('api::question-set.question-set', id, {data: secondData});
                // newEntity = await strapi.services['question-set'].update({id}, secondData);
            }
        } else { //Ekleme
            for (let i = 0; i < requestQuestionGroup.length; i++) {
                if (requestQuestionGroup[i].isAdded) {
                    entityQuestionGroup.push({
                        id: requestQuestionGroup[i].id,
                        title: requestQuestionGroup[i].title,
                        description: requestQuestionGroup[i].description,
                        audio: requestQuestionGroup[i].audio
                    });
                }
            }
            const data = {
                title: ctx.request.body.title,
                description: ctx.request.body.description,
                question_groups: entityQuestionGroup ? [] : entityQuestionGroup.map(m => m.id)
            }
            newEntity = await strapi.entityService.create('api::question-set.question-set', {data: data});
            // newEntity = await strapi.services['question-set'].create(data);
        }
        
    
        const question_set = {
            id: newEntity.id,
            title: newEntity.title,
            description: newEntity.description
        }

        
        return sanitize.contentAPI.output(question_set);
        // return sanitizeEntity(question_set, {model: strapi.models['question-set']});
    },
    
    async update(ctx) {
        let entity;
        if (ctx.is('multipart')) {
            const {data, files} = parseMultipartData(ctx);
            entity = await strapi.entityService.update(ctx.params, {data:data}, {files});
            // entity = await strapi.services['question-set'].update(ctx.params, data, {files});
        } else {
            entity = await strapi.entityService.update(ctx.params, {data: ctx.request.body});
            entity = await strapi.services['question-set'].update(ctx.params, ctx.request.body);
        }
    
        const question_set = {
            id: entity.id,
            title: entity.title,
            description: entity.description
        }
    
        return sanitize.contentAPI.output(question_set);
        // return sanitizeEntity(question_set, {model: strapi.models['question-set']});
    },
    
    async deletecustom(ctx) {
        const {id} = ctx.params;
        const entity = await strapi.query('api::question-set.question-set').findOne({where: {id: id}, populate: true});
        // const entity = await strapi.services['question-set'].findOne({id});
        // console.log(entity.quizzes);
        if (entity.quizzes.length) {
            const question_set = {
                status: false,
                message: 'Bu soru seti sınavda kullanıldığı için silinemez.',
                data: {
                    id: entity.id,
                    title: entity.title,
                    description: entity.description
                }
            }
    
            return sanitize.contentAPI.output(question_set);
            // return sanitizeEntity(question_set, {model: strapi.models['question-set']});
        } else {
            const entity = await strapi.entityService.delete('api::question-set.question-set', id);
            // const entity = await strapi.services['question-set'].delete(ctx.params);
            const question_set = {
                status: true,
                message: 'Soru seti başarıyla silinmiştir.',
                data: {
                    id: entity.id,
                    title: entity.title,
                    description: entity.description
                }
            }
    
            return sanitize.contentAPI.output(question_set);
            // return sanitizeEntity(question_set, {model: strapi.models['question-set']});
        }
    
        const question_set = {
            id: entity.id,
            title: entity.title,
            description: entity.description
        }
    
        // return sanitizeEntity(question_set, {model: strapi.models['question-set']});
        return sanitize.contentAPI.output(question_set);
    },
    
    async copy(ctx) {
        const {id, title} = ctx.request.body;
        const copyEntity = await strapi.query('api::question-set.question-set').findOne({id});
        // const copyEntity = await strapi.services['question-set'].findOne({id});
    
        const data = {
            title: title,
            question_groups: copyEntity.question_groups
        };
        const entity = await strapi.entityService.create('api::question-set.question-set',{data:data});
        // const entity = await strapi.services['question-set'].create(data);
    
        const question_set = {
            id: entity.id,
            title: entity.title,
            description: entity.description
        };
    
        return sanitize.contentAPI.output(question_set);
        // return sanitizeEntity(question_set, {model: strapi.models['question-set']});
    },
    
    async list(ctx) {
        const limit = parseInt(ctx.query._limit) || 500;
        const start = parseInt(ctx.query._start) || 0;
        const entities = await strapi.query('api::question-set.question-set').findMany({
            where: {
                $and: [
                    {title: {$containsi: ctx.query.title}},
                ],
            },
            orderBy: { createdAt: 'desc' },
            offset: start, 
            limit: limit,
            populate: true,
        })
        const questionSetCount = await strapi.query('api::question-set.question-set').count({
            where: {
                $and: [
                    {title: {$containsi: ctx.query.title}}
                ]
            }
        })
        // const entities = await strapi.services['question-set'].find({ title_containsi: ctx.query.title, _limit: limit, _start: start , _sort: 'createdAt:desc'});
        // const questionSetCount =  await strapi.query('question-set').count({title_containsi: ctx.query.title});
        const list = [];
    
        entities.map(async item => {
            let count = 0;
    
            /*
            let questionCountControl = true;
            if(questionCountControl) {
                item.question_groups.map(x => {
                    count += x.questionCount;
                });
            }
            else {
                const questionGroupCount = item.question_groups.length;
                for(let i = 0; i < questionGroupCount; i++) {
                    const questionGroup =  await strapi.services['question-group'].find({id: item.question_groups[i].id});
                    console.log( questionGroup[0].questions.length )
                    await strapi.services['question-group'].update({id: item.question_groups[i].id}, {questionCount: questionGroup[0].questions.length});
                }
            }
            */
    
            item.question_groups.map(x => {
                count += x.questionCount;
            });
    
            let entity = {
                id: item.id,
                title: item.title,
                usedQuizzes: item.quizzes.map(x => ({
                    title: x.title
                })),
                questionCount: count,
                createdAt: item.createdAt,
                status: item.quizzes.length > 0 ? true : false
            }
    
    
            list.push(entity);
        })
    
         const datas = {
            data: list,
            page: Math.ceil(questionSetCount / limit),
            count: questionSetCount,
            limit,
            pageNumber: Math.ceil(start / limit) + 1,
        };

        return sanitize.contentAPI.output(datas);
    }
}))
