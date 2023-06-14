module.exports = {
    routes: [
        {
            "method": "GET",
            "path": "/question-sets",
            "handler": "question-set.find",
            "config": {
                "policies": []
            }
        },
        // {
        //     "method": "GET",
        //     "path": "/question-sets/count",
        //     "handler": "question-set.count",
        //     "config": {
        //         "policies": []
        //     }
        // },
        {
            "method": "GET",
            "path": "/question-set/list",
            "handler": "question-set.list",
            "config": {
                "policies": []
            }
        },
        {
            "method": "GET",
            "path": "/question-sets/ekle",
            "handler": "question-set.ekle",
            "config": {
                "policies": []
            }
        },
        {
            "method": "GET",
            "path": "/question-sets/:id",
            "handler": "question-set.findOne",
            "config": {
                "policies": []
            }
        },
        {
            "method": "POST",
            "path": "/question-setssave",
            "handler": "question-set.createcustom",
            "config": {
                "policies": []
            }
        },
        {
            "method": "PUT",
            "path": "/question-sets/:id",
            "handler": "question-set.update",
            "config": {
                "policies": []
            }
        },
        {
            "method": "DELETE",
            "path": "/question-setsdelete/:id",
            "handler": "question-set.deletecustom",
            "config": {
                "policies": []
            }
        },
        {
            "method": "POST",
            "path": "/question-set/copy",
            "handler": "question-set.copy",
            "config": {
                "policies": []
            }
        }
    ]
}



