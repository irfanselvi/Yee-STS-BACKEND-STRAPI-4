module.exports = {
    routes: [
        {
            "method": "GET",
            "path": "/questions",
            "handler": "question.find",
            "config": {
              "policies": []
            }
          },
          // {
          //   "method": "GET",
          //   "path": "/questions/count",
          //   "handler": "question.count",
          //   "config": {
          //     "policies": []
          //   }
          // },
          {
            "method": "GET",
            "path": "/questions/:id",
            "handler": "question.findOne",
            "config": {
              "policies": []
            }
          },
          {
            "method": "POST",
            "path": "/questions",
            "handler": "question.create",
            "config": {
              "policies": []
            }
          },
          {
            "method": "PUT",
            "path": "/questions/:id",
            "handler": "question.update",
            "config": {
              "policies": []
            }
          },
          {
            "method": "DELETE",
            "path": "/questions/:id",
            "handler": "question.delete",
            "config": {
              "policies": []
            }
          }
    ]
  }
  