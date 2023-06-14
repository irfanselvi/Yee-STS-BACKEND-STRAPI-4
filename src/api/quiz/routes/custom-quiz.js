module.exports = {
    routes: [
        {
            "method": "GET",
            "path": "/quizzes",
            "handler": "quiz.find",
            "config": {
                "policies": []
            }
        },
        // {
        //     "method": "GET",
        //     "path": "/quizzes/count",
        //     "handler": "quiz.count",
        //     "config": {
        //         "policies": []
        //     }
        // },
        {
            "method": "GET",
            "path": "/quizzes/active",
            "handler": "quiz.active",
            "config": {
                "policies": []
            }
        },
        {
            "method": "GET",
            "path": "/quizzes/list",
            "handler": "quiz.list",
            "config": {
                "policies": []
            }
        },
        {
            "method": "GET",
            "path": "/quizzes/:id",
            "handler": "quiz.findOne",
            "config": {
                "policies": []
            }
        },
        {
            "method": "GET",
            "path": "/quizzes/questions/:quizId/:studentId",
            "handler": "quiz.questions",
            "config": {
                "policies": []
            }
        },
        {
            "method": "GET",
            "path": "/quizzes/questionsStudent/:id/:cryptic",
            "handler": "quiz.questionsStudent",
            "config": {
                "policies": []
            }
        },
        {
            "method": "POST",
            "path": "/quizzescreate",
            "handler": "quiz.createcustom",
            "config": {
                "policies": []
            }
        },
        {
            "method": "PUT",
            "path": "/quizzesupdate/:id",
            "handler": "quiz.updatecustom",
            "config": {
                "policies": []
            }
        },
        {
            "method": "DELETE",
            "path": "/quizzesdelete/:id",
            "handler": "quiz.deletecustom",
            "config": {
                "policies": []
            }
        },
        {
            "method": "GET",
            "path": "/quiz/reports",
            "handler": "quiz.reports",
            "config": {
                "policies": []
            }
        },
        {
            "method": "GET",
            "path": "/quiz/reportscreate",
            "handler": "quiz.reportscreate",
            "config": {
                "policies": []
            }
        },
        {
            "method": "GET",
            "path": "/quiz/students/:id",
            "handler": "quiz.students",
            "config": {
                "policies": []
            }
        },
        {
            "method": "GET",
            "path": "/quiz/result/:id",
            "handler": "quiz.result",
            "config": {
                "policies": []
            }
        },
        {
            "method": "GET",
            "path": "/quizzes/student/:quizid/:studentid",
            "handler": "quiz.student",
            "config": {
                "policies": []
            }
        },
        {
            "method": "GET",
            "path": "/quiz/studentopenended/:quizId/:studentId",
            "handler": "quiz.studentOpenEnded",
            "config": {
                "policies": []
            }
        }
    ]
}



