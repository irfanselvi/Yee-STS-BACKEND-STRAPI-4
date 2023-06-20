'use strict';

/**
 * quiz controller
 */
const { sanitize } = require('@strapi/utils');
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::quiz.quiz', ({ strapi }) => ({
    async find(ctx) {
        let entities;
        if (ctx.query._q) {
            entities = await strapi.query('api::quiz.quiz').search({ where: { ...ctx.query } });
            // entities = await strapi.services.quiz.search(ctx.query);
        } else {
            entities = await strapi.query('api::quiz.quiz').findMany({ where: { ...ctx.query } });
            // entities = await strapi.services.quiz.find(ctx.query);
        }

        let list = entities.map(entity => ({
            id: entity.id,
            title: entity.title,
            description: entity.description,
            startDate: entity.startDate,
            endDate: entity.endDate,
            time: entity.time,
            isKeyboard: entity.isKeyboard,
            cryptic: entity.cryptic
        }));

        // return list.map(entity =>
        //     sanitizeEntity(entity, { model: strapi.models.quiz })
        // );
        return sanitize.contentAPI.output(list)
    },

    async findOne(ctx) {
        const entity = await strapi.services['api::quiz.quiz'].findOne({ ...ctx.params });
        // const entity = await strapi.services.quiz.findOne(ctx.params);
        let question_set = {};

        if (entity.question_set) {
            question_set = {
                id: entity.question_set.id,
                title: entity.question_set.title,
                description: entity.question_set.description
            }
        }

        const quiz = {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            startDate: entity.startDate,
            endDate: entity.endDate,
            isKeyboard: entity.isKeyboard,
            time: entity.time,
            cryptic: entity.cryptic,
            question_set
        }
        // return sanitizeEntity(quiz, { model: strapi.models.quiz });
        return sanitize.contentAPI.output(quiz)
    },

    async questions(ctx) {
        const userid = ctx.params.studentId;
        const quizid = ctx.params.quizId;
        const entity = await strapi.services['api::quiz.quiz'].findOne({ id: quizid  });
        // const entity = await strapi.services.quiz.findOne({ id: quizid });

        let id = entity.question_set.id;
        // const question_set = await strapi.services['question-set'].findOne({ id });
        // const question_set = await strapi.services['api::question-set.question-set'].findOne({ id:id } );
        const question_set = entity.question_set;
        console.log(question_set)
        if (question_set) {
            let newQuiz = {
                id: entity.id,
                title: entity.title,
                description: entity.description,
                startDate: entity.startDate,
                endDate: entity.endDate,
                time: entity.time,
                question_set: {
                    id: question_set.id,
                    title: question_set.title,
                    description: question_set.description,
                    question_qroups: []
                }
            }
            let questions = [];
            for (let i = 0; i < question_set.question_groups.length; i++) {
                console.log(question_set.question_groups[i])
                id = question_set.question_groups[i].id;
                let question_group = await strapi.services['api::question-group.question-group'].findOne({ id: id });
                questions = [];
                for (let i = 0; i < question_group.questions.length; i++) {
                    let questionId = question_group.questions[i].id;
                    let answer = await strapi.services['api::quiz.quiz'].findAnswer({ user: userid, quiz: entity.id, question: questionId });
                    let data = {
                        id: question_group.questions[i].id,
                        question: question_group.questions[i].question,
                        type: question_group.questions[i].type,
                        answer: ctx.state.user.role.type === 'coordinator' ? question_group.questions[i].answer : '',
                        a: question_group.questions[i].a,
                        b: question_group.questions[i].b,
                        c: question_group.questions[i].c,
                        d: question_group.questions[i].d,
                        e: question_group.questions[i].e,
                        userAnswer: answer !== null && ctx.state.user.role.type === 'coordinator' ? {
                            id: answer.id,
                            time: answer.time,
                            answer: answer.answer,
                            openEndedText: answer.openEndedText,
                            openEndedImage: answer.openEndedImage

                        } : ''
                    }
                    questions.push(data);
                }
                question_group = {
                    id: question_group.id,
                    title: question_group.title,
                    description: question_group.description,
                    questiontext: question_group.questiontext,
                    audio: question_group.audio,
                    questions: questions
                }

                newQuiz.question_set.question_qroups.push(question_group);
            }
            return sanitize.contentAPI.output(newQuiz);
        } else {
   
            let nQuiz = {
                id: entity.id,
                title: entity.title,
                description: entity.description,
                startDate: entity.startDate,
                endDate: entity.endDate,
                time: entity.time,
                question_set: {}
            }
            return sanitize.contentAPI.output(nQuiz);
        }
    },

    async questionsStudent(ctx) {
        const entity = await strapi.services['api::quiz.quiz'].findOne({ id: ctx.params.id });
        // const entity = await strapi.services.quiz.findOne({ id: ctx.params.id });
        if (entity.cryptic && ctx.params.cryptic !== entity.cryptic) {
            let nQuiz = {
                status: false,
                message: 'Sınav için gönderdiğiniz şifre hatalıdır.',
                data: {
                    id: entity.id,
                    title: entity.title,
                    description: entity.description,
                    startDate: entity.startDate,
                    endDate: entity.endDate,
                    time: entity.time,
                    isKeyboard: entity.isKeyboard,
                    remainingTime: 0,
                    question_set: {}
                }
            }
            return sanitize.contentAPI.output(nQuiz)
            // return ctx.throw(400, 'Sınav için gönderdiğiniz şifre hatalıdır.');
        }

        const now = new Date;
        const startQuiz = new Date(entity.startDate);
        startQuiz.setHours(startQuiz.getHours() - 3);
        const endQuiz = new Date(entity.endDate);
        endQuiz.setHours(endQuiz.getHours() - 3);

        if (now < startQuiz) {
            let nQuiz = {
                status: false,
                message: 'Sınav Başlamamıştır.',
                data: {
                    id: entity.id,
                    title: entity.title,
                    description: entity.description,
                    startDate: entity.startDate,
                    endDate: entity.endDate,
                    isKeyboard: entity.isKeyboard,
                    time: entity.time,
                    remainingTime: 0,
                    question_set: {}
                }
            }
            return sanitize.contentAPI.output(nQuiz)
        }

        if (now > endQuiz) {
            let nQuiz = {
                status: false,
                message: 'Sınav Zamanı Dolmuştur',
                data: {
                    id: entity.id,
                    title: entity.title,
                    description: entity.description,
                    startDate: entity.startDate,
                    endDate: entity.endDate,
                    time: entity.time,
                    isKeyboard: entity.isKeyboard,
                    remainingTime: 0,
                    question_set: {}
                }
            }
            return sanitize.contentAPI.output(nQuiz)
        }


        let quizState;
        // strapi.query('api::quiz.quiz').findOne({ id: ctx.params.id });
        // console.log(entity.id)
        const findQuizState = await strapi.query('api::quiz-state.quiz-state').findOne({ where: { user: ctx.state.user.id, quiz: entity.id } });
        // const findQuizState = null
        // console.log(findQuizState)
        if (findQuizState === null) {
            const u = [{
                id: ctx.state.user.id
            }]

            const state = {
                quiz: entity.id,
                user: u.map(m => m.id),
                start: new Date()
            }
            quizState = await strapi.entityService.create('api::quiz-state.quiz-state', { data: state })
            // await strapi.services['api::quiz-state.quiz-state'].create(state);
        } else {
            quizState = findQuizState;
        }

        const startQuizState = new Date(quizState.start);
        // const startQuizState = new Date();
        // console.log(entity)
        let userId = [];
        for (let i = 0; i < entity.users.length; i++) {
            userId.push(entity.users[i].id);
        }

        if (userId.indexOf(ctx.state.user.id) === -1) {
            entity.users.push({
                id: ctx.state.user.id,
                username: ctx.state.user.username,
                email: ctx.state.user.email,
                provider: ctx.state.user.provider,
                password: ctx.state.user.password,
                resetPasswordToken: ctx.state.user.resetPasswordToken,
                confirmed: ctx.state.user.confirmed,
                blocked: ctx.state.blocked,
                role: ctx.state.user.role
            })
            const data = {
                users: entity.users.map(m => m.id)
            }
            const id = entity.id;
            await strapi.entityService.update('api::quiz.quiz', id, { data: data });
            // await strapi.services['api::quiz.quiz'].update({ id }, data);
            // await strapi.services.quiz.update({ id }, data);
        }

        let time;
        if ((Math.round(endQuiz.getTime() - startQuizState.getTime()) / 1000) / 60 > entity.time) {
            time = entity.time;
        } else {
            time = (Math.round(endQuiz.getTime() - startQuizState.getTime()) / 1000) / 60;
        }

        const remainingTime = Math.round((now.getTime() - startQuizState.getTime()) / 1000);

        let userAnswerAll = [];
        if (ctx.state.user.role.type === 'student') {
            userAnswerAll = await strapi.query('api::answer.answer').findMany({
                where: {
                    user: ctx.state.user.id,
                    quiz: entity.id,
                },
                populate: true,
            });
            // userAnswerAll = await strapi.services['api::quiz.quiz'].findAnswerAllUserBy({
            //     user: ctx.state.user.id,
            //     quiz: entity.id,
            // });
        }

        // console.log(userAnswerAll)

        if (entity.question_set) {
            let id = entity.question_set.id;
            const question_set = await strapi.query('api::question-set.question-set').findOne({
                where: {
                    id: id
                },
                populate: true,
            });
            if (question_set) {
                let newQuiz = {
                    status: remainingTime > (time * 60) ? false : true,
                    message: remainingTime > (time * 60) ? 'Süreniz Dolmuştur' : 'Sınava Devam Edebilirsiniz',
                    data: {
                        id: entity.id,
                        title: entity.title,
                        description: entity.description,
                        startDate: entity.startDate,
                        endDate: entity.endDate,
                        time: entity.time,
                        isKeyboard: entity.isKeyboard,
                        remainingTime: (time * 60) - remainingTime > 0 ? (time * 60) - remainingTime : 0,
                        question_set: {
                            id: question_set.id,
                            title: question_set.title,
                            description: question_set.description,
                            question_qroups: []
                        }
                    }
                }
                let question_groups_listno = [];
                let questions = [];
                let qgroups_nolist = [];
                if (question_set.question_groups) {
                    for (let i = 0; i < question_set.question_groups.length; i++) {
                        id = question_set.question_groups[i].id;
                        let q = await strapi.query('api::question-group.question-group').findOne({
                            where: {
                                id: id
                            },
                            populate: true,
                        });
                        if (q.list_no) {
                            question_groups_listno.push(q.list_no);
                        } else {
                            qgroups_nolist.push(q);
                        }
                    }

                    question_groups_listno.sort();

                    for (let i = 0; i < question_groups_listno.length; i++) {
                        let question_group = await strapi.services['api::question-group.question-group'].findListNo({ list_no: question_groups_listno[i] });
                        questions = [];
                        for (let i = 0; i < question_group.questions.length; i++) {
                            let questionId = question_group.questions[i].id;
                            // let answer = await strapi.services.quiz.findAnswer({
                            //     user: ctx.state.user.id,
                            //     quiz: entity.id,
                            //     question: questionId
                            // });
                            let answer = null;
                            let userAnswerresult = userAnswerAll.find(xx => xx.question.id == questionId);
                            answer = userAnswerresult ? userAnswerresult : null;
                            let data = {
                                id: question_group.questions[i].id,
                                question: question_group.questions[i].question,
                                type: question_group.questions[i].type,
                                answer: ctx.state.user.role.type === 'coordinator' && question_group.questions[i].answer,
                                a: question_group.questions[i].a,
                                b: question_group.questions[i].b,
                                c: question_group.questions[i].c,
                                d: question_group.questions[i].d,
                                e: question_group.questions[i].e,
                                userAnswer: answer !== null /*&& ctx.state.user.role.type === 'student' ? */ ? {
                                    id: answer.id,
                                    time: answer.time,
                                    answer: answer.answer
                                } : ''
                            }
                            questions.push(data);
                        }

                        question_group = {
                            id: question_group.id,
                            title: question_group.title,
                            skill: question_group.skill,
                            description: question_group.description,
                            questiontext: question_group.questiontext,
                            listeningCount: question_group.listeningCount,
                            audio: question_group.audio,
                            list_no: question_group.list_no,
                            questions: questions
                        }

                        newQuiz.data.question_set.question_qroups.push(question_group);
                    }

                    if (qgroups_nolist) {
                        let qg = {};
                        for (let i = 0; i < qgroups_nolist.length; i++) {
                            questions = [];

                            for (let j = 0; j < qgroups_nolist[i].questions.length; j++) {
                                let questionId = qgroups_nolist[i].questions[j].id;
                                // let answer = await strapi.services.quiz.findAnswer({
                                //     user: ctx.state.user.id,
                                //     quiz: entity.id,
                                //     question: questionId
                                // });
                                let answer = null;
                                let userAnswerresult = userAnswerAll?.find(xx => xx.question.id == questionId);
                                answer = userAnswerresult ? userAnswerresult : null;
                                let data = {
                                    id: qgroups_nolist[i].questions[j].id,
                                    question: qgroups_nolist[i].questions[j].question,
                                    type: qgroups_nolist[i].questions[j].type,
                                    answer: ctx.state.user.role.type === 'coordinator' ? qgroups_nolist[i].questions[j].answer : '',
                                    a: qgroups_nolist[i].questions[j].a,
                                    b: qgroups_nolist[i].questions[j].b,
                                    c: qgroups_nolist[i].questions[j].c,
                                    d: qgroups_nolist[i].questions[j].d,
                                    e: qgroups_nolist[i].questions[j].e,

                                    userAnswer: answer !== null && ctx.state.user.role.type === 'student' ? {
                                        id: answer.id,
                                        time: answer.time,
                                        answer: answer.answer,
                                        openEndedText: answer.openEndedText,
                                        openEndedImage: answer.openEndedImage
                                    } : ''
                                }
                                questions.push(data);
                            }

                            qg = {
                                id: qgroups_nolist[i].id,
                                title: qgroups_nolist[i].title,
                                skill: qgroups_nolist[i].skill,
                                type: qgroups_nolist[i].type,
                                description: qgroups_nolist[i].description,
                                questiontext: qgroups_nolist[i].questiontext,
                                listeningCount: qgroups_nolist[i].listeningCount,
                                audio: qgroups_nolist[i].audio,
                                questions: questions
                            }

                            newQuiz.data.question_set.question_qroups.push(qg);
                        }
                    }
                }
                return sanitize.contentAPI.output(newQuiz)
            } else {
                let nQuiz = {
                    status: remainingTime > (time * 60) ? false : true,
                    message: remainingTime > (time * 60) ? 'Süreniz Dolmuştur' : 'Sınava Devam Edebilirsiniz',
                    data: {
                        id: entity.id,
                        title: entity.title,
                        description: entity.description,
                        startDate: entity.startDate,
                        endDate: entity.endDate,
                        time: entity.time,
                        isKeyboard: entity.isKeyboard,
                        remainingTime: (time * 60) - remainingTime > 0 ? (time * 60) - remainingTime : 0,
                        question_set: {}
                    }
                }
                return sanitize.contentAPI.output(nQuiz)
            }

        } else {
            let nQuiz = {
                status: remainingTime > (time * 60) ? false : true,
                message: remainingTime > (time * 60) ? 'Süreniz Dolmuştur' : 'Sınava Devam Edebilirsiniz',
                data: {
                    id: entity.id,
                    title: entity.title,
                    description: entity.description,
                    startDate: entity.startDate,
                    endDate: entity.endDate,
                    time: entity.time,
                    isKeyboard: entity.isKeyboard,
                    remainingTime: (time * 60) - remainingTime > 0 ? (time * 60) - remainingTime : 0,
                    question_set: {}
                }
            }
            return sanitize.contentAPI.output(nQuiz)
        }
    },

    async createcustom(ctx) {
        let entity;
        
        let reqdata = ctx.request.body 
        entity = await strapi.entityService.create('api::quiz.quiz', { data: ctx.request.body });
        const quiz = {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            startDate: entity.startDate,
            endDate: entity.endDate,
            time: entity.time
        }

        return sanitize.contentAPI.output(quiz)
        // return sanitizeEntity(quiz, { model: strapi.models.quiz });
    },

    async updatecustom(ctx) {
        let entity;
        entity = await strapi.entityService.update('api::quiz.quiz',ctx.params.id, { data: ctx.request.body });
        let quiz = {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            startDate: entity.startDate,
            endDate: entity.endDate,
            time: entity.time
        }
        return sanitize.contentAPI.output(quiz)
        // return sanitizeEntity(quiz, { model: strapi.models.quiz });
    },

    async deletecustom(ctx) {
        const entity = await strapi.services['api::quiz.quiz'].findOne(ctx.params);
        // const entity = await strapi.services.quiz.findOne(ctx.params);
        if (entity.users.length) {
            const quiz = {
                status: false,
                message: 'Sınava katılım sağlandığı için sınavi silemezsiniz.',
                data: {
                    id: entity.id,
                    title: entity.title,
                    description: entity.description,
                    startDate: entity.startDate,
                    endDate: entity.endDate,
                    time: entity.time
                }
            }

            return sanitize.contentAPI.output(quiz)
            // return sanitizeEntity(quiz, { model: strapi.models.quiz });
        } else {
            const entity = await strapi.entityService.delete('api::quiz.quiz', ctx.params.id);
            // const entity = await strapi.services.quiz.delete(ctx.params);
            const quiz = {
                status: true,
                message: 'Sınav başarıyla silindi.',
                data: {
                    id: entity.id,
                    title: entity.title,
                    description: entity.description,
                    startDate: entity.startDate,
                    endDate: entity.endDate,
                    time: entity.time
                }
            }
            return sanitize.contentAPI.output(quiz)
            // return sanitizeEntity(quiz, { model: strapi.models.quiz });
        }
    },

    async active(ctx) {
        let entities;
        let startQuiz;
        let entity;
        let list = [];
        const now = new Date;
        entities = await strapi.services['api::quiz.quiz'].active();

        for (let i = 0; i < entities.length; i++) {
            startQuiz = new Date(entities[i].startDate);
            startQuiz.setHours(startQuiz.getHours() - 3);

            entity = {
                id: entities[i].id,
                title: entities[i].title,
                description: entities[i].description,
                startDate: entities[i].startDate,
                endDate: entities[i].endDate,
                time: entities[i].time,
                isCryptic: entities[i].cryptic ? true : false,
                remainingTime: startQuiz > now ? (startQuiz.getTime() - now.getTime()) / 1000 : 0,
                status: startQuiz > now ? false : true
            }

            list.push(entity);
        }

        // return list.map(entity =>
        //     sanitizeEntity(entity, { model: strapi.models.quiz })
        // );
        return sanitize.contentAPI.output(list)
    },

    async list(ctx) {
        const limit = parseInt(ctx.query._limit) || 100;
        const start = parseInt(ctx.query._start) || 0;
        let entities;
        let count;
        const now = new Date;
        now.setHours(now.getHours()+3);

        if (ctx.query.status === 'active') {
            entities = await strapi.query('api::quiz.quiz').findMany(
                {
                    where: {
                        $and: [
                            {
                                title: { $containsi: ctx.query.title },
                            },
                            {
                                startDate: { $lte: now },
                            },
                            {
                                endDate: { $gte: now },
                            },
                        ],
                    },
                    orderBy: { startDate: 'asc' },
                    offset: start,
                    limit: limit,
                    populate: true,
                },
            );
          
            count = await strapi.query('api::quiz.quiz').count(
                {
                    where: {
                        $and: [
                            {
                                title: { $containsi: ctx.query.title },
                            },
                            {
                                startDate: { $lte: now },
                            },
                            {
                                endDate: { $gte: now },
                            },
                        ],
                    },
                }
            );
            // { startDate_lte: now, endDate_gte: now, _sort: 'startDate:asc', title_containsi: ctx.query.title, _limit: limit, _start: start });
            // count = await strapi.query('api::quiz.quiz').count({ startDate_lte: now, title_containsi: ctx.query.title, endDate_gte: now });
        }
        else if (ctx.query.status === 'ready') {
            entities = await strapi.query('api::quiz.quiz').findMany(
                {
                    where: {
                        $and: [
                            {
                                title: { $containsi: ctx.query.title },
                            },
                            {
                                startDate: { $gt: now },
                            },
                        ],
                    },
                    orderBy: { startDate: 'desc' },
                    offset: start,
                    limit: limit,
                    populate: true,
                },
            );
            count = await strapi.query('api::quiz.quiz').count(
                {
                    where: {
                        $and: [
                            {
                                title: { $containsi: ctx.query.title },
                            },
                            {
                                startDate: { $gt: now },
                            },
                        ],
                    },
                }
            );
            // entities = await strapi.query('api::quiz.quiz').findMany({ startDate_gt: now, _sort: 'startDate:asc', title_containsi: ctx.query.title, _limit: limit, _start: start });
            // count = await strapi.query('api::quiz.quiz').count({ startDate_gt: now, title_containsi: ctx.query.title });
        }
        else if (ctx.query.status === 'ended') {
            entities = await strapi.query('api::quiz.quiz').findMany(
                {
                    where: {
                        $and: [
                            {
                                title: { $containsi: ctx.query.title },
                            },
                            {
                                endDate: { $lt: now },
                            },
                        ],
                    },
                    orderBy: { startDate: 'desc' },
                    offset: start,
                    limit: limit,
                    populate: true,
                },
            );
            count = await strapi.query('api::quiz.quiz').count(
                {
                    where: {
                        $and: [
                            {
                                title: { $containsi: ctx.query.title },
                            },
                            {
                                endDate: { $lt: now },
                            },
                        ],
                    },
                }
            );
            // entities = await strapi.query('api::quiz.quiz').findMany({ endDate_lt: now, _sort: 'startDate:desc', title_containsi: ctx.query.title, _limit: limit, _start: start });
            // count = await strapi.query('api::quiz.quiz').count({ endDate_lt: now, title_containsi: ctx.query.title });
        }
        else {
            entities = await strapi.query('api::quiz.quiz').findMany(
                {
                    where: {
                        $and: [
                            {
                                title: { $containsi: ctx.query.title },
                            },
                        ],
                    },
                    orderBy: { startDate: 'desc' },
                    offset: start,
                    limit: limit,
                    populate: true,
                },
            );
            // console.log(entities)
            count = await strapi.query('api::quiz.quiz').count(
                {
                    where: {
                        $and: [
                            {
                                title: { $containsi: ctx.query.title },
                            },
                        ],
                    },
                }
            );
            // entities = await strapi.query('api::quiz.quiz').findMany({ _sort: 'startDate:desc', title_containsi: ctx.query.title, _limit: limit, _start: start });
            // count = await strapi.query('api::quiz.quiz').count({ title_containsi: ctx.query.title });
        }

        let startQuiz;
        let endQuiz;
        const list = [];

        entities.map(item => {
            startQuiz = new Date(item.startDate);
            endQuiz = new Date(item.endDate);

            if (startQuiz > now) {
                list.push({
                    id: item.id,
                    title: item.title,
                    time: item.time,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    userCount: item.users.length,
                    statusCode: 0,
                    status: "Başlamamış Sınav"
                });
            }
            else if (startQuiz < now && endQuiz > now) {
                list.push({
                    id: item.id,
                    title: item.title,
                    time: item.time,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    userCount: item.users.length,
                    statusCode: 1,
                    status: "Aktif Sınav"
                });
                console.log(item.startDate)
                var d = new Date(item.startDate);
                console.log(d.getUTCHours()); // Hours
                console.log(d.getUTCMinutes());
                console.log(d.getUTCSeconds());
            }
            else {
                list.push({
                    id: item.id,
                    title: item.title,
                    time: item.time,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    userCount: item.users.length,
                    statusCode: 2,
                    status: "Bitmiş Sınav"
                });
            }
        });
        const datas = {
            data: list,
            page: Math.ceil(count / limit),
            count,
            limit,
            pageNumber: Math.ceil(start / limit) + 1,
        }
        return sanitize.contentAPI.output(datas);
    },
    async reports(ctx) {
        const quizCount = await strapi.query('api::quiz.quiz').count();
        const attendanceCount = await strapi.query('api::quiz-state.quiz-state').count();
        const questionCount = await strapi.query('api::question.question').count();

        // const quizCount = await strapi.query('quiz').count();
        // const attendanceCount = await strapi.query('quiz-state').count();
        // const questionCount = await strapi.query('question').count();
        const studentCount = await strapi.query('plugin::users-permissions.user').count({ role: '5ea027165f348f477e285d97' });

        const entity = {
            quizCount: quizCount,
            attendanceCount: attendanceCount,
            questionCount: questionCount,
            studentCount: studentCount
        }

        return sanitize.contentAPI.output(entity);
        // return sanitizeEntity(entity, { model: strapi.models.quiz });
    },
    // eksik
    async reportscreate(ctx) {
        const studentCount = await strapi.query('plugin::users-permissions.user').findMany({ role: '5ea027165f348f477e285d97', _limit: 50000 });

        const state = [];
        studentCount.map(x => {
            const quiz = [];
            x.quizzes.map(y => {
                quiz.push(y.id)
            });

            if (quiz.length > 0) {
                quiz.map(y => {

                    state.push({
                        user: x.id,
                        quiz: y,
                        start: new Date(2020, 5, 30, 12, 0, 0, 0),
                        end: new Date(2020, 5, 30, 12, 40, 0, 0),
                    });
                })
            }
        });

        for (let i = ctx.query.start; i < ctx.query.end; i++) {
            await strapi.services['quiz-state'].create(state[i]);
        }

        const entity = {
            state: state.length,
            start: ctx.query.start,
            end: ctx.query.end
        }

        // return sanitizeEntity(entity, { model: strapi.models.quiz });
        return sanitize.contentAPI.output(entity);
    },

    async result(ctx) {
        const quiz = await strapi.services['api::quiz.quiz'].findOne({id:ctx.params.id});
        // const quiz = await strapi.services.quiz.findOne(ctx.params);

        const list = [];
        const allGroups = [];
        for (let item of quiz.question_set.question_groups) {
            const group = await strapi.services['api::question-group.question-group'].findOne({id: item.id });
            // const group = await strapi.services['question-group'].findOne({ id: item });
            
            // console.log(group)
            allGroups.push(group);
        }

        const userLenght = quiz.users.length;

        for (let i = 0; i < userLenght; i++) {
            const user = quiz.users[i];
            const groups = [];
            let readingScore = 0;
            let listeningScore = 0;
            let writingScore = 0;

            const userAnswer = await strapi.services['api::answer.answer'].findUserAnswers({
                user: user.id,
                quiz: ctx.params.id
            });
            
            // console.log(userAnswer)
            allGroups.map(group => {
                const numberOfQuestion = group.questions.length;
                let numberOfAnswered = 0;
                let numberOfCorrect = 0;
                let numberOfWrong = 0;
                let numberOfNon = 0;

                group.questions.map(item => {
                    const foundIndex = userAnswer.findIndex(data => data.question.id.toString() === item.id.toString());
                    // console.log(userAnswer[foundIndex])
                    if (foundIndex > -1) {
                        // answer = userAnswer[foundIndex]?.answer;
                        numberOfAnswered++;

                        if (userAnswer[foundIndex].answer === item.answer) {

                            if (group.skill != 'writing' && group.type != 'OpenEnded') {
                                numberOfCorrect++;
                            }

                            if (group.skill === 'reading') {
                                readingScore += userAnswer[foundIndex].question.score && parseFloat(userAnswer[foundIndex].question.score);
                            } else if (group.skill === 'listening') {
                                listeningScore += userAnswer[foundIndex].question.score && parseFloat(userAnswer[foundIndex].question.score);
                            } else if (group.skill === 'writing') {
                                writingScore += userAnswer[foundIndex].score && parseFloat(userAnswer[foundIndex].score);
                            }

                        }
                        else {
                            if (group.skill != 'writing' && group.type != 'OpenEnded') {
                                numberOfWrong++;
                            }

                        }
                    }
                    else {
                        numberOfNon++;
                    }
                });

                groups.push({
                    title: group.title,
                    id: group.id,
                    totalQuestion: numberOfQuestion,
                    correctAnswer: numberOfCorrect,
                    totalAnswer: numberOfAnswered,
                    wrongAnswer: numberOfWrong,
                    nonAnswer: numberOfNon
                });
            })

            list.push({
                id: user.id,
                username: user.username,
                email: user.email,
                readingScore: readingScore,
                listeningScore: listeningScore,
                writingScore: writingScore,
                questionGroups: groups
            });
        }

        // return list.map(entity =>
        //     sanitizeEntity(entity, { model: strapi.models.quiz })
        // );
        return sanitize.contentAPI.output(list);
    },

    async student(ctx) {
        const userid = ctx.params.studentid;
        const quizid = ctx.params.quizid;
        const allGroups = [];
        const groupList = [];

        let totalQuestionCount = 0;
        let totalScore = 0;
        let numberOfAnswered = 0;
        let numberOfCorrect = 0;
        let numberOfWrong = 0;
        let user = {};

        // const quiz = await strapi.services.quiz.findOne({ id: quizid });
        const quiz = await strapi.services['api::quiz.quiz'].findOne({ id: quizid });
        /* const answers_of_user = strapi.query('answer').findMany({
              user: userid.toString(),
              quiz: quizid.toString()
          })
         */

        const answers_of_user = await strapi.query('api::answer.answer').findMany({ where: { user: userid.toString(), quiz: quizid.toString() } });
        // const answers_of_user = await strapi.services['answer'].find({ user: userid.toString(), quiz: quizid.toString() });

        //console.log('--->', answers_of_user);

        for (item of quiz.question_set.question_groups) {
            const group = await strapi.services['api::question-group.question-group'].findOne({ id: item });
            // const group = await strapi.services['question-group'].findOne({ id: item });
            allGroups.push(group)
            totalQuestionCount += group.questions.length;
        }

        let quizz = {
            id: quizid.toString(),
            title: quiz.title,
            startDate: quiz.startDate,
            endDate: quiz.endDate,
            description: quiz.description,
            time: quiz.time
        }

        for (let i = 0; i < quiz.users.length; i++) {
            if (quiz.users[i].id.toString() === userid.toString()) {
                // const quiz_state = await strapi.services['quiz-state'].findOne({ id: quiz.users[i].quiz_state });
                const quiz_state = await strapi.services['api::quiz-state.quiz-state'].findOne({ id: quiz.users[i].quiz_state });

                user = {
                    id: quiz.users[i].id,
                    username: quiz.users[i].username,
                    email: quiz.users[i].email,
                    start: quiz_state != null ? quiz_state.start : null,
                    end: quiz_state != null ? quiz_state.end : null
                }
            }
        }

        allGroups.map(item => {
            groupList.push({
                id: item.id,
                type: item.type,
                skill: item.skill,
                name: item.title,
                questionCount: item.questions.length,
                correctAnswer: 0,
                totalAnswer: 0,
                wrongAnswer: 0,
                totalScore: 0,
                question: item.questions,
            })
        });

        let readingScore = 0;
        let listeningScore = 0;
        let writingScore = 0;

        groupList.map(group => {
            let totalAnswer = 0;
            let correctAnswer = 0;
            let wrongAnswer = 0;
            let score = 0;




            if (group.type === 'OpenEnded') {
                answers_of_user.map(item => {
                    const foundIndex = group.question.findIndex(data => data.id === item.question.id);
                    if (foundIndex > -1) {
                        score += item.score && parseFloat(item.score);
                        writingScore += item.score && parseFloat(item.score);
                        if (item.openEndedImage.length > 0) {
                            totalAnswer++;
                        }
                    }
                });

                group.questionCount = group.question.length;
                group.totalAnswer = totalAnswer;
                group.correctAnswer = null;
                group.wrongAnswer = null;
                group.totalScore = score;
                group.nonAnswer = group.question.length - totalAnswer;
            }
            else {
                answers_of_user.map(item => {
                    const foundIndex = group.question.findIndex(data => data.id === item.question.id);
                    if (foundIndex > -1) {
                        totalAnswer++;
                        group.question[foundIndex].userAnswer = item.answer;

                        if (group.question[foundIndex].answer === item.answer) {
                            correctAnswer++;
                            score += group.question[foundIndex].score && parseFloat(group.question[foundIndex].score);
                            if (group.skill === 'reading') {
                                readingScore += group.question[foundIndex].score && parseFloat(group.question[foundIndex].score);
                            } else if (group.skill === 'listening') {
                                listeningScore += group.question[foundIndex].score && parseFloat(group.question[foundIndex].score);
                            }

                        }
                        else {
                            wrongAnswer++;
                        }

                    }
                });

                group.questionCount = group.question.length;
                group.totalAnswer = totalAnswer;
                group.correctAnswer = correctAnswer;
                group.wrongAnswer = wrongAnswer;
                group.totalScore = score;
                group.nonAnswer = group.question.length - totalAnswer;
            }
        });

        groupList.map(group => {
            totalScore += group.totalScore;
            numberOfAnswered += group.totalAnswer;
            numberOfCorrect += group.correctAnswer;
            numberOfWrong += group.wrongAnswer;
            group.question = null;
        });

        const entitiy = {
            user: user,
            quiz: quizz,
            totalCount: {
                answer: numberOfAnswered,
                question: totalQuestionCount,
                correctAnswer: numberOfCorrect,
                wrongAnswer: numberOfWrong,
                totalScore: totalScore,
                nonAnswer: totalQuestionCount - numberOfAnswered,
                readingScore: readingScore,
                listeningScore: listeningScore,
                writingScore: writingScore,

            },
            lessons: groupList
        };

        // return sanitizeEntity(entitiy, { model: strapi.models.quiz })
        return sanitize.contentAPI.output(entitiy);
    },

    async create(ctx) {
        let entity;
        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            entity = await strapi.entityService.create('api::quiz.quiz', { data: data }, { files });
            // entity = await strapi.services.quiz.create(data, { files });
        } else {
            entity = await strapi.entityService.create('api::quiz.quiz', { data: ctx.request.body });
            // entity = await strapi.services.quiz.create(ctx.request.body);
        }

        const quiz = {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            startDate: entity.startDate,
            endDate: entity.endDate,
            time: entity.time
        }

        // return sanitizeEntity(quiz, { model: strapi.models.quiz });
        return sanitize.contentAPI.output(quiz);
    },

    async update(ctx) {
        let entity;
        if (ctx.is('multipart')) {
            const { data, files } = parseMultipartData(ctx);
            entity = await strapi.entityService.update('api::quiz.quiz', ctx.params, { data: data }, { files });
            // entity = await strapi.services.quiz.update(ctx.params, data, { files });
        } else {
            entity = await strapi.entityService.update('api::quiz.quiz', ctx.params, { data: ctx.request.body });
            // entity = await strapi.services.quiz.update(ctx.params, ctx.request.body);
        }

        let quiz = {
            id: entity.id,
            title: entity.title,
            description: entity.description,
            startDate: entity.startDate,
            endDate: entity.endDate,
            time: entity.time
        }

        return sanitize.contentAPI.output(quiz);
        // return sanitizeEntity(quiz, { model: strapi.models.quiz });
    },

    async delete(ctx) {
        const entity = await strapi.services['api::quiz.quiz'].findOne(ctx.params);
        // const entity = await strapi.services.quiz.findOne(ctx.params);
        if (entity.users.length) {
            const quiz = {
                status: false,
                message: 'Sınava katılım sağlandığı için sınavi silemezsiniz.',
                data: {
                    id: entity.id,
                    title: entity.title,
                    description: entity.description,
                    startDate: entity.startDate,
                    endDate: entity.endDate,
                    time: entity.time
                }
            }

            // return sanitizeEntity(quiz, { model: strapi.models.quiz });
            return sanitize.contentAPI.output(quiz);
        } else {
            const entity = await strapi.entityService.delete('api::quiz.quiz', ctx.params);
            // const entity = await strapi.services.quiz.delete(ctx.params);
            const quiz = {
                status: true,
                message: 'Sınav başarıyla silindi.',
                data: {
                    id: entity.id,
                    title: entity.title,
                    description: entity.description,
                    startDate: entity.startDate,
                    endDate: entity.endDate,
                    time: entity.time
                }
            }

            // return sanitizeEntity(quiz, { model: strapi.models.quiz });
            return sanitize.contentAPI.output(quiz);
        }
    },

    async active(ctx) {
        let entities;
        let startQuiz;
        let entity;
        let list = [];
        const now = new Date;
        entities = await strapi.services['api::quiz.quiz'].active();
        for (let i = 0; i < entities.length; i++) {
            startQuiz = new Date(entities[i].startDate);
            startQuiz.setHours(startQuiz.getHours() - 3);
            const findQuizState = await strapi.query('api::quiz-state.quiz-state').findOne({ where: { user: ctx.state.user.id, quiz: entities[i].id } });
            let minDiff = null;
            // if (findQuizState != null) {
            //     const baslangicTarihi = new Date(findQuizState.start);
            //     const examStartTime = baslangicTarihi;
            //     const examDurationInMinutes = parseInt(entities[i].time);

            //     // Şu anki zamanı al
            //     const now = new Date();

            //     // Sınavın bitiş zamanını hesapla
            //     const examEndTime = new Date(examStartTime.getTime() + examDurationInMinutes * 60000);

            //     // Sınavın başlamasına kalan süreyi dakika cinsinden hesapla
            //     const remainingMinutes = Math.ceil((examStartTime.getTime() - now.getTime()) / 60000);

            //     // Sınav süresinin dolmasına kalan süreyi dakika cinsinden hesapla
            //     const remainingTime = Math.max(0, Math.ceil((examEndTime.getTime() - now.getTime()) / 60000));

            //     console.log('Sınava başlamasına kalan dakika:', remainingMinutes);
            //     console.log('Sınav süresinin dolmasına kalan dakika:', remainingTime);
            //     minDiff = remainingTime ? remainingTime : null;
            // }
            entity = {
                id: entities[i].id,
                title: entities[i].title,
                description: entities[i].description,
                startDate: entities[i].startDate,
                endDate: entities[i].endDate,
                time: entities[i].time,
                stateTime: minDiff,
                isCryptic: entities[i].cryptic ? true : false,
                remainingTime: startQuiz > now ? (startQuiz.getTime() - now.getTime()) / 1000 : 0,
                status: startQuiz > now ? false : true
            }

            list.push(entity);
        }
        return sanitize.contentAPI.output(list)
        // return list.map(entity =>

        //     sanitize.contentAPI.output(entity)
        // );
    },

    async student(ctx) {
        const userid = ctx.params.studentid;
        const quizid = ctx.params.quizid;
        const allGroups = [];
        const groupList = [];

        let totalQuestionCount = 0;
        let totalScore = 0;
        let numberOfAnswered = 0;
        let numberOfCorrect = 0;
        let numberOfWrong = 0;
        let user = {};

        const quiz = await strapi.services['api::quiz.quiz'].findOne({ id: quizid });
        // const quiz = await strapi.services.quiz.findOne({ id: quizid });
        /* const answers_of_user = strapi.query('answer').findMany({
              user: userid.toString(),
              quiz: quizid.toString()
          })
         */
        const answers_of_user = await await strapi.query('api::answer.answer').findMany({ where: { user: userid.toString(), quiz: quizid.toString() },  populate: true, });
        // const answers_of_user = await strapi.services['answer'].find({ user: userid.toString(), quiz: quizid.toString() });

        //console.log('--->', answers_of_user);

        for (let item of quiz.question_set.question_groups) {
            const group = await strapi.services['api::question-group.question-group'].findOne({ id: item.id });
            // const group = await strapi.services['question-group'].findOne({ id: item });
            allGroups.push(group)
            totalQuestionCount += group.questions.length;
        }

        let quizz = {
            id: quizid.toString(),
            title: quiz.title,
            startDate: quiz.startDate,
            endDate: quiz.endDate,
            description: quiz.description,
            time: quiz.time
        }

        for (let i = 0; i < quiz.users.length; i++) {
            if (quiz.users[i].id.toString() === userid.toString()) {
                const quiz_state = await strapi.services['api::quiz-state.quiz-state'].findOne({ id: quizid });
                // const quiz_state = await strapi.services['quiz-state'].findOne({ id: quiz.users[i].quiz_state });

                user = {
                    id: quiz.users[i].id,
                    username: quiz.users[i].username,
                    email: quiz.users[i].email,
                    start: quiz_state != null ? quiz_state.start : null,
                    end: quiz_state != null ? quiz_state.end : null
                }
            }
        }

        allGroups.map(item => {
            groupList.push({
                id: item.id,
                type: item.type,
                skill: item.skill,
                name: item.title,
                questionCount: item.questions.length,
                correctAnswer: 0,
                totalAnswer: 0,
                wrongAnswer: 0,
                totalScore: 0,
                question: item.questions,
            })
        });

        let readingScore = 0;
        let listeningScore = 0;
        let writingScore = 0;

        groupList.map(group => {
            let totalAnswer = 0;
            let correctAnswer = 0;
            let wrongAnswer = 0;
            let score = 0;




            if (group.type === 'OpenEnded') {
                answers_of_user.map(item => {
                    const foundIndex = group.question.findIndex(data => data.id === item.question.id);
                    if (foundIndex > -1) {
                        score += item.score && parseFloat(item.score);
                        writingScore += item.score && parseFloat(item.score);
                        if (item.openEndedImage?.length > 0) {
                            totalAnswer++;
                        }
                    }
                });

                group.questionCount = group.question.length;
                group.totalAnswer = totalAnswer;
                group.correctAnswer = null;
                group.wrongAnswer = null;
                group.totalScore = score;
                group.nonAnswer = group.question.length - totalAnswer;
            }
            else {
                answers_of_user.map(item => {
                    const foundIndex = group.question.findIndex(data => data.id === item.question.id);
                    if (foundIndex > -1) {
                        totalAnswer++;
                        group.question[foundIndex].userAnswer = item.answer;

                        if (group.question[foundIndex].answer === item.answer) {
                            correctAnswer++;
                            score += group.question[foundIndex].score && parseFloat(group.question[foundIndex].score);
                            if (group.skill === 'reading') {
                                readingScore += group.question[foundIndex].score && parseFloat(group.question[foundIndex].score);
                            } else if (group.skill === 'listening') {
                                listeningScore += group.question[foundIndex].score && parseFloat(group.question[foundIndex].score);
                            }

                        }
                        else {
                            wrongAnswer++;
                        }

                    }
                });

                group.questionCount = group.question.length;
                group.totalAnswer = totalAnswer;
                group.correctAnswer = correctAnswer;
                group.wrongAnswer = wrongAnswer;
                group.totalScore = score;
                group.nonAnswer = group.question.length - totalAnswer;
            }
        });

        groupList.map(group => {
            totalScore += group.totalScore;
            numberOfAnswered += group.totalAnswer;
            numberOfCorrect += group.correctAnswer;
            numberOfWrong += group.wrongAnswer;
            group.question = null;
        });

        const entitiy = {
            user: user,
            quiz: quizz,
            totalCount: {
                answer: numberOfAnswered,
                question: totalQuestionCount,
                correctAnswer: numberOfCorrect,
                wrongAnswer: numberOfWrong,
                totalScore: totalScore,
                nonAnswer: totalQuestionCount - numberOfAnswered,
                readingScore: readingScore,
                listeningScore: listeningScore,
                writingScore: writingScore,

            },
            lessons: groupList
        };

        // return sanitizeEntity(entitiy, { model: strapi.models.quiz })
        return sanitize.contentAPI.output(entitiy);
    },

    async students(ctx) {

        const quiz = await strapi.services['api::quiz.quiz'].findOne({ ...ctx.params });

        if (quiz) {
            const questionGroups = quiz.question_set.question_groups;
            const users = quiz.users;
            const questions = [];
            const liste = [];
            const studentList = [];
            //* Açık uçlu soruları tespit eder
            for (let i = 0; i < questionGroups.length; i++) {
                // console.log(questionGroups[i]?.id,'test123')
                const questionGroup = await strapi.services['api::question-group.question-group'].findOne({ id: questionGroups[i]?.id });

                if (questionGroup.type === 'OpenEnded') {
                    questionGroup.questions.map(x => {
                        questions.push(x.id);
                    });
                }
            }

            //* Cevap veren öğrencilerin listesini oluşturur
            // const tumCevaplar = await strapi.services.answer.find({ quiz: quiz.id, _limit: 100000 });
            const tumCevaplar = await await strapi.query('api::answer.answer').findMany({ where: { quiz: quiz.id }, limit: 100000, populate: true, });
            tumCevaplar.map(item => {
                // console.log(questions[0], item.question.id, questions[0] === item.question.id)
                const studentIndex = liste.findIndex(x => x.id === item.user.id);
                const questionIndex = questions.findIndex(x => x === item.question.id);

                if (studentIndex === -1) {
                    const answerList = [];
                    if (questionIndex > -1) {
                        answerList.push(item.question.id);
                    }

                    liste.push({
                        id: item.user.id,
                        username: item.user.username,
                        email: item.user.email,
                        answer: answerList,
                        uploadFile: false
                    });
                }
                else if (studentIndex > -1 && questionIndex > -1) {
                    const answerList = liste[studentIndex].answer;
                    answerList.push(item.question.id);
                    liste[studentIndex].answer = answerList;
                }
            });

            //* Öğrenci bilgilerini düzenler
            liste.map(x => {
                let uploadFile = false;

                if (questions.length > 0 && x.answer.length === questions.length) {
                    uploadFile = true;
                }

                studentList.push({
                    id: x.id,
                    username: x.username,
                    email: x.email,
                    uploadFile: uploadFile
                });
            });

            //* Sorulara cevap veren öğrencilere, sınava girip cevap vermeyeneleri ekler
            users.map(item => {
                const index = studentList.findIndex(x => x.id === item.id);

                if (index === -1) {
                    studentList.push({
                        id: item.id,
                        username: item.username,
                        email: item.email,
                        uploadFile: false
                    });
                }
            });

            return studentList;
        }
        else {
            return ctx.badRequest(null, 'Bad Request');
        }
    },

    async studentOpenEnded(ctx) {
        const userid = ctx.params.studentId;
        const quizid = ctx.params.quizId;
        const questionList = [];
        const quizAnswerList = [];

        const quiz = await strapi.services['api::quiz.quiz'].findOne({ id: quizid });

        for (let item of quiz.question_set.question_groups) {
            const group = await strapi.services['api::question-group.question-group'].findOne({ id: item.id });
            // const group = await strapi.services['question-group'].findOne({ id: item.id });

            if (group.type === 'OpenEnded') {
                group.questions.map(x => {
                    questionList.push({
                        id: x.id,
                        question: x.question,
                        type: group.type,
                    });
                })
            }
        }

        for (let item of questionList) {
            const answersOfUser = await await strapi.query('api::answer.answer').findOne({
                where: {
                    question: item.id,
                    user: userid,
                    quiz: quizid
                },
                populate: true,
            });
            // const answersOfUser = await strapi.services.answer.findOne({
            //     question: item.id,
            //     user: userid,
            //     quiz: quizid
            // });

            if (answersOfUser) {

                quizAnswerList.push({
                    answers: {
                        id: answersOfUser.id,
                        time: answersOfUser.time,
                        openEndedImage: answersOfUser.openEndedImage,
                        openEndedText: answersOfUser.openEndedText,
                    },
                    question: {
                        ...item,
                        score: answersOfUser.score || null
                    }
                });
            }
            else {
                quizAnswerList.push({
                    question: {
                        ...item,
                        score: null
                    },
                    answers: null
                });
            }
        }

        return quizAnswerList;
    },


}));
