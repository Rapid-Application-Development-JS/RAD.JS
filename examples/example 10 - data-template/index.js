(function (document, window) {
    'use strict';

    var scripts = [
        "../libs/iscroll-lite.js",

        "source/models/message.js",

        "source/views/widget1/widget1.js",
        "source/views/widget2/widget2.js"
    ];

    function onEndLoad() {

        var core = window.RAD.core;

        core.initialize();

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

    }

    window.RAD.scriptLoader.loadScripts(scripts, onEndLoad);
}(document, window));