module.exports = {
    routes: [
        {
            "method": "GET",
            "path": "/question-groups",
            "handler": "question-group.find",
            "config": {
                "policies": []
            }
        },
        {
            "method": "GET",
            "path": "/question-groups/list",
            "handler": "question-group.list",
            "config": {
                "policies": []
            }
        },
        // {
        //     "method": "GET",
        //     "path": "/question-groups/count",
        //     "handler": "question-group.count",
        //     "config": {
        //         "policies": []
        //     }
        // },
        {
            "method": "GET",
            "path": "/question-groups/:id",
            "handler": "question-group.findOne",
            "config": {
                "policies": []
            }
        },
        {
            "method": "POST",
            "path": "/question-groupscreate",
            "handler": "question-group.createcustom",
            "config": {
                "policies": []
            }
        },
        {
            "method": "PUT",
            "path": "/question-groupsupdate/:id",
            "handler": "question-group.updatecustom",
            "config": {
                "policies": []
            }
        },
        {
            "method": "DELETE",
            "path": "/question-groupsdelete/:id",
            "handler": "question-group.deletecustom",
            "config": {
                "policies": []
            }
        }
    ]
}



