module.exports = {
    routes: [
        {
            "method": "GET",
            "path": "/announcements",
            "handler": "announcement.find",
            "config": {
                "policies": []
            }
        },
        // {
        //     "method": "GET",
        //     "path": "/announcements/count",
        //     "handler": "announcement.count",
        //     "config": {
        //         "policies": []
        //     }
        // },
        // {
        //     "method": "GET",
        //     "path": "/announcements/:id",
        //     "handler": "announcement.findOne",
        //     "config": {
        //         "policies": []
        //     }
        // },
        // {
        //     "method": "POST",
        //     "path": "/announcements",
        //     "handler": "announcement.create",
        //     "config": {
        //         "policies": []
        //     }
        // },
        // {
        //     "method": "PUT",
        //     "path": "/announcements/:id",
        //     "handler": "announcement.update",
        //     "config": {
        //         "policies": []
        //     }
        // },
        // {
        //     "method": "DELETE",
        //     "path": "/announcements/:id",
        //     "handler": "announcement.delete",
        //     "config": {
        //         "policies": []
        //     }
        // }
    ]
}



