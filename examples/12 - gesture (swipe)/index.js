(function (document, window) {
    'use strict';

    var scripts = [
        "../libs/iscroll-lite.js",

        "source/application/application.js",

        "source/views/parent_widget/parent_widget.js",
        "source/views/inner/first_widget/first_widget.js",
        "source/views/inner/second_widget/second_widget.js",
        "source/views/inner/third_widget/third_widget.js"
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