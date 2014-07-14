(function (document, window) {
    'use strict';

    var scripts = [
        "../libs/iscroll-lite.js",
        "source/jst/templates.js",

        "source/application/application.js",

        "source/views/first_page/start_page.js",
        "source/views/second_page/second_page.js"
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