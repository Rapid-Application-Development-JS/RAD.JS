RAD.application(function (core) {
    var app = this;

    app.start = function () {
        var options = {
            container_id: '#screen',
            content: "first.screen",
            animation: 'none'
        };
       core.publish('navigation.show', options);
    };

    app.registerView = function (ID) {
        core.register(ID, RAD.namespace('ChildView').extend({}));
    };

    app.unregisterView = function (ID) {
        core.stop(ID);
    };

    app.showSecond = function () {
        core.publish('navigation.show', {
            container_id: '#screen',
            content: "second.screen",
            animation: 'slide'
        });
    };

    app.showFirst = function () {
        core.publish('navigation.show', {
            container_id: '#screen',
            content: "first.screen",
            animation: 'slide-out'
        });
    };

    return app;
}, true);
