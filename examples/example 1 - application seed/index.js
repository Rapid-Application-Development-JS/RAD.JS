(function (document, window) {
    'use strict';

    var scripts = [
        "source/views/start_page.js"
    ];

    function onEndLoad() {
        RAD.core.initialize();
        RAD.core.publish('navigation.show', {
            container_id: '#screen',
            content: 'view.start_page',
            animation: 'none'
        });
    }
    window.RAD.scriptLoader.loadScripts(scripts, onEndLoad);
}(document, window));