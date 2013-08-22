(function (document, window) {
    'use strict';

    var scripts = [
        "../js/iscroll-lite.js",

        "source/application/application.js",

        "source/views/screen_1/screen_1.js",
        "source/views/screen_2/screen_2.js",
        "source/views/screen_3/screen_3.js",
        "source/views/top/top.js",
        "source/views/screen_3/subscreen_1/subscreen_1.js",
        "source/views/screen_3/subscreen_1/first/first.js",
        "source/views/screen_3/subscreen_1/second/second.js",
        "source/views/screen_3/subscreen_1/second/tab_inner_1/tab_inner_1.js",
        "source/views/screen_3/subscreen_1/second/tab_inner_2/tab_inner_2.js",
        "source/views/screen_3/subscreen_2/subscreen_2.js",
        "source/views/screen_3/subscreen_3/subscreen_3.js"
    ];

    function onEndLoad() {

        var core = window.RAD.core,
            application = window.RAD.application,
            coreOptions = {
                defaultBackstack: false,
                backstackType: "custom", //"native", "hashbang", "custom"
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