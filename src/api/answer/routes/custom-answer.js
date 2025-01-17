module.exports = {
    routes: [
        {
            "method": "GET",
            "path": "/answers",
            "handler": "answer.find",
            "config": {
                "policies": []
            }
        },
        // {
        //     "method": "GET",
        //     "path": "/answers/count",
        //     "handler": "answer.count",
        //     "config": {
        //         "policies": []
        //     }
        // },
        {
            "method": "GET",
            "path": "/answers/:id",
            "handler": "answer.findOne",
            "config": {
                "policies": []
            }
        },
        {
            "method": "POST",
            "path": "/answers",
            "handler": "answer.create",
            "config": {
                "policies": []
            }
        },
        {
            "method": "POST",
            "path": "/answers/createforstudent",
            "handler": "answer.createForStudent",
            "config": {
                "policies": []
            }
        },
        {
            "method": "PUT",
            "path": "/answers/:id",
            "handler": "answer.update",
            "config": {
                "policies": []
            }
        },
        {
            "method": "DELETE",
            "path": "/answers/:id",
            "handler": "answer.delete",
            "config": {
                "policies": []
            }
        },
        {
            "method": "DELETE",
            "path": "/answers/openendedimage/:id",
            "handler": "answer.openendedimage",
            "config": {
                "policies": []
            }
        }
    ]
}
