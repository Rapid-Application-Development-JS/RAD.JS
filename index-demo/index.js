(function (document, window) {
    'use strict';

    var scripts = [
        "libs/iscroll.js",

        // Models
        "source/models/models.js",

        // Application
        "source/application/application.js",

        // Views
        "source/views/main_screen/main_screen.js",
        "source/views/menu/menu.js",
        "source/views/inner/test/test.js",
        "source/views/inner/cards/cards.js",
        "source/views/inner/filter/filter.js",
        "source/views/inner/stats/stats.js",
        "source/views/inner/about/about.js",
        "source/views/alert/alert.js",
        "source/views/dialog/dialog.js",
        "source/views/image_view/image_view.js",
        "source/views/loading/loading.js",

        // Service
        "source/services/localstorage.js",
        "source/services/json_loader.js"
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