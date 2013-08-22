(function (document, window) {
    'use strict';

    var scripts = [
        "../js/iscroll-lite.js",

        "source/application/application.js",

        "source/views/parent_widget/parent_widget.js",
        "source/views/menu/menu.js",
        "source/views/inner/first_widget/first_widget.js",
        "source/views/inner/second_widget/second_widget.js",
        "source/views/inner/third_widget/third_widget.js",
        "source/views/inner/third_widget/content-first/content-first.js",
        "source/views/inner/third_widget/content-second/content-second.js",
        "source/views/inner/third_widget/content-third/content-third.js",
        "source/views/inner/third_widget/content-second/first/first.js",
        "source/views/inner/third_widget/content-second/second/second.js",
        "source/views/dialog/dialog.js",
        "source/views/popup/popup.js"
    ];

    function onEndLoad() {

        var view = window.RAD.views,
            core = window.RAD.core,
            views = [
                {"view.parent_widget": view.ParentWidget},
                {"view.menu": view.menu},
                {"view.inner_first_widget": view.InnerFirstWidget},
                {"view.inner_second_widget": view.InnerSecondWidget},
                {"view.inner_third_widget": view.InnerThirdWidget},
                {"view.content_first_widget": view.ContentFirstWidget},
                {"view.content_second_widget": view.ContentSecondWidget},
                {"view.content_third_widget": view.ContentThirdWidget},
                {"view.first": view.FirstWidget},
                {"view.second": view.SecondWidget},
                {"view.dialog": view.Dialog},
                {"view.popup": view.Popup}
            ],
            application = new window.RAD.application(core),
            coreOptions = {
                defaultBackstack: false,
                defaultAnimation: 'slide',
                animationTimeout: 5000,
                debug: false
            };

        //initialize core by new application object
        core.initialize(application, coreOptions);

        //register views
        core.registerAll(views);

        //start
        application.start();
    }

    window.RAD.scriptLoader.loadScripts(scripts, onEndLoad);
}(document, window));