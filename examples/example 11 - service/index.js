(function (document, window) {
    'use strict';

    var scripts = [
        "../libs/iscroll-lite.js",

        "source/application/application.js",

        "source/views/widget1/widget1.js",
        "source/views/widget2/widget2.js",
        "source/service/services.js"
    ];

    function onEndLoad() {

        var core = window.RAD.core,
            application = window.RAD.application;

        //initialize core by new application object
        core.initialize(application);

        //start
        application.start();
    }

    window.RAD.scriptLoader.loadScripts(scripts, onEndLoad);
}(document, window));