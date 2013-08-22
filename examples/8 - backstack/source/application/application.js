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
        var options;

        function closeAll() {
            var index,
                length,
                current,
                arr,
                running = core.getStartedViews();

            //stop all views except first screen(login screen)
            for (index = 0, length = running.length; index < length; index += 1) {
                current = running[index];
                arr = current.split('.');
                if (current !== "view.screen_1" && arr[0] !== 'plugin') {
                    core.stop(current);
                }
            }

            //TODO clear all models

            //clear backstack
            core.publish('router.clear', null);

            //TODO init services
        }

        // show new login screen
        options = {
            container_id: '#screen',
            content: "view.screen_1",
            animation: animation,
            callback: closeAll
        };
        core.publish('navigation.show', options);
    };

    return app;
}, true);

