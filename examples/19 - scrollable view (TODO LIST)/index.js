(function (document, window) {
    'use strict';

    var scripts = [
        "../js/iscroll-lite.js",

        "source/application/application.js",

        "source/models/data.js",

        "source/views/start_page.js"
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