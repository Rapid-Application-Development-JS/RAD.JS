(function (document, window) {
    'use strict';

    var scripts = [
        "../libs/iscroll-lite.js",

        "source/application/application.js",

        "source/views/page/start_page.js",
        "source/views/toast/toast.js"
    ];

    function onEndLoad() {

        var application = window.RAD.application;

        //initialize core by new application object
        window.RAD.core.initialize(application);

        //start
        application.start();
    }

    window.RAD.scriptLoader.loadScripts(scripts, onEndLoad);
}(document, window));