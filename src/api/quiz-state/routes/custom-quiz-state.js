module.exports = {
    routes: [
        {
            "method": "GET",
            "path": "/quiz-states",
            "handler": "quiz-state.find",
            "config": {
              "policies": []
            }
          },
        //   {
        //     "method": "GET",
        //     "path": "/quiz-states/count",
        //     "handler": "quiz-state.count",
        //     "config": {
        //       "policies": []
        //     }
        //   },
          {
            "method": "GET",
            "path": "/quiz-states/:id",
            "handler": "quiz-state.findOne",
            "config": {
              "policies": []
            }
          },
          {
            "method": "POST",
            "path": "/quiz-states",
            "handler": "quiz-state.create",
            "config": {
              "policies": []
            }
          },
          {
            "method": "PUT",
            "path": "/quiz-states/:id",
            "handler": "quiz-state.update",
            "config": {
              "policies": []
            }
          },
          {
            "method": "DELETE",
            "path": "/quiz-states/:id",
            "handler": "quiz-state.delete",
            "config": {
              "policies": []
            }
          }
    ]
}



