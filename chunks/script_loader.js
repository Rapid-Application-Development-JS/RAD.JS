var execute = require('./utils').execute;

function ScriptLoader() {
    var loader = this,
        isLoaded = false;

    function loadScript(url, checkCallback) {

        if (!url || typeof url != 'string') {
            window.console.log('Can\'t load script, URL is incorrect:' + url);
            return;
        }

        var script = document.createElement("script");

        script.type = "text/javascript";
        script.async = true;

        if (script.readyState) {  //IE
            script.onreadystatechange = function () {
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    script.onreadystatechange = null;
                    checkCallback();
                }
            };
        } else {
            script.onload = checkCallback;
            script.onerror = checkCallback;
        }

        script.src = url;
        document.head.appendChild(script);
    }

    function loadArray(urls, callback, context) {
        var i, l = urls.length, counter = 0;

        loader.arr = null;
        loader.callback = null;
        loader.context = null;

        function check() {
            counter += 1;
            if (counter === l) {
                execute(callback, null, context);
            }
        }

        for (i = 0; i < l; i += 1) {
            loadScript(urls[i], check);
        }
    }

    function onLoad() {
        isLoaded = true;
        loader.loadScripts = loadArray;
        if (loader.arr && loader.callback) {
            loader.loadScripts(loader.arr, loader.callback, loader.context);
        }
    }

    loader.loadScripts = function (urls, callback, context) {
        loader.arr = urls;
        loader.callback = callback;
        loader.context = context;
    };

    if (window.attachEvent) {
        window.attachEvent('onload', onLoad);
    } else {
        window.addEventListener('load', onLoad, false);
    }

    return loader;
}

exports.scriptLoader = ScriptLoader;