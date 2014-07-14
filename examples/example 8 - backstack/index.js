(function (document, window) {
    'use strict';

    var scripts = [
        "../libs/iscroll-lite.js",

        "source/application/application.js",

        "source/views/screen_1/screen_1.js",
        "source/views/screen_2/screen_2.js",
        "source/views/screen_3/screen_3.js",
        "source/views/screen_3/inner_tabs/first/first.js",
        "source/views/screen_3/inner_tabs/second/second.js",

        "source/views/screen_3/inner_screen_1/inner_screen_1.js",
        "source/views/screen_3/inner_screen_2/inner_screen_2.js",
        "source/views/screen_3/inner_screen_3/inner_screen_3.js",
        "source/views/screen_3/inner_screen_4/inner_screen_4.js"
    ];

    function onEndLoad() {

        var core = window.RAD.core,
            application = window.RAD.application,
            coreOptions = {
                defaultBackstack: false,
                backstackType: "native", //"native", "hashbang", "custom"
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