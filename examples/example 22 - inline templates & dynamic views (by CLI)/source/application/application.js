RAD.application(function (core) {
    var app = this;

    app.start = function () {
        var options = {
            container_id: '#screen',
            content: "view.parent",
            animation: 'none'
        };
       core.publish('navigation.show', options);
    };

    return app;
}, true);
