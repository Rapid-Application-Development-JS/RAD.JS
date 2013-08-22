RAD.application(function (core) {
    'use strict';

    var app = this;

    app.start = function () {
        core.publish('navigation.show', {
            container_id: '#screen',
            content: "view.parent",
            animation: 'none'
        });
    };

    return app;
}, true);

