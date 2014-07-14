RAD.application(function (core) {
    'use strict';

    var app = this;

    app.start = function () {
        var options = {
            container_id: '#screen',
            content: "view.screen_1",
            animation: 'none'
        };
        core.publish('navigation.show', options);
    };

    app.login = function () {
        var options = {
            container_id: '#screen',
            content: "view.screen_2",
            backstack: true
        };
        core.publish('navigation.show', options);
    };

    app.logout = function (animation) {
        core.publish('router.clear');
        core.publish('navigation.show', {
            container_id: '#screen',
            content: "view.screen_1",
            animation: animation
        });
    };

    return app;
}, true);

