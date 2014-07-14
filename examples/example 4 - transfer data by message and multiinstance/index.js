(function (document, window) {
    'use strict';

    var scripts = [
        "../libs/iscroll-lite.js",

        "source/application/application.js",

        "source/views/parent/parent.js",
        "source/views/widget1/widget1.js",
        "source/views/widget2/widget2.js",
        "source/views/receiver/receiver.js"
    ];

    function onEndLoad() {

        var core = window.RAD.core,
            application = window.RAD.application,
            coreOptions = {
                defaultBackstack: false,
                defaultAnimation: 'slide',
                animationTimeout: 3000,
                debug: false
            };

        //initialize core by new application object
        core.initialize(application, coreOptions);

        //start
        application.start();
    }

    window.RAD.scriptLoader.loadScripts(scripts, onEndLoad);
}(document, window));