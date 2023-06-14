'use strict';

/**
 * quiz service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::quiz.quiz', ({ strapi }) => ({
    async active() {
        let now = new Date();
        now.setHours(now.getHours() + 3);

        let fiveDays = new Date();
        fiveDays.setDate(fiveDays.getDate() + 5);

        // const data = strapi.entityService.findOne({ endDate_gt: now, startDate_lte: fiveDays, _sort: 'startDate:asc' });
        const { results } = await super.find({
            filters: {
                $and: [
                    {
                        startDate: { $lte: fiveDays },
                    },
                    {
                        endDate: { $gt: now },
                    },
                ],
            },
            sort: 'startDate:asc',
        });
        // some custom logic
        results.forEach(result => {
            result.counter = 1;
        });

        return results;
    },

    findOne(params, populate) {
        console.log(params.id)
        return strapi.query('api::quiz.quiz').findOne({
            where: {
                $and: [
                    { id: params.id }
                ]
            },
            populate: {
                question_set: { populate: true },
                users: true,
                answers: true
            }
        });
        // return strapi.query('api::quiz.quiz').findOne({ id: params.id, populate: ['up_users']  });
    },

    findAnswer(params, populate) {
        return strapi.query('api::answer.answer').findOne({ where: { user: params.user, quiz: params.quiz, question: params.question }, populate: true });
    },

    findAnswerAllUserBy(params, populate) {
        return strapi.query('api::answer.answer').find({ where: { user: params.user, quiz: params.quiz }, populate: true });
    },

    findQuizState(params, populate) {
        return strapi.query('api::quiz-state.quiz-state').findOne({ where: { user: params.user, quiz: params.quiz }, populate: true });
    },
}));
