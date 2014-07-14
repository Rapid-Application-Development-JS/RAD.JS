RAD.application(function (core) {
    'use strict';

    var app = this;

    app.start = function () {
        core.startService();
        core.publish('navigation.show', {
            container_id: '#widget1',
            content: "view.widget1",
            animation: 'none'
        });
        core.publish('navigation.show', {
            container_id: '#widget2',
            content: "view.widget2",
            animation: 'none'
        });
    };

    return app;
}, true);

