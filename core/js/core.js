(function (document, window) {
    var defaultOptions = {
        defaultBackstack: false,
        backstackType: 'custom',
        defaultAnimation: 'slide',
        animationTimeout: 3000,
        debug: false
    };

    function execute(func, args, context) {
        if (typeof func !== "function") {
            return;
        }
        if (context && context instanceof Object) {
            func.apply(context, args);
        } else {
            func(args);
        }
    }

    function isArray(value) {
        return (Object.prototype.toString.call(value) === '[object Array]');
    }

    function namespace(destination, obj) {
        var parts = destination.split('.'),
            parent = window.RAD,
            pl,
            i;
        if (parts[0] === "RAD") {
            parts = parts.slice(1);
        }
        pl = parts.length;
        for (i = 0; i < pl; i += 1) {
            //create a property if it doesn't exist
            if (parent[parts[i]] === undefined) {
                if (i === pl - 1) {
                    parent[parts[i]] = obj;
                } else {
                    parent[parts[i]] = {};
                }
            }
            parent = parent[parts[i]];
        }
        return parent;
    }

    function ScriptLoader() {
        var loader = this,
            isLoaded = false;

        function loadScript(url, checkCallback) {
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
            } else {  //Others
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

    function closest(element, className) {
        var result;
        if (element.classList && element.classList.contains(className)) {
            result = element;
        } else if (element.parentNode) {
            result = closest(element.parentNode, className);
        }
        return result;
    }

    function preventBodyTouch(e) {
        var tracker = this.scrollTracker;
        if (!tracker.scrollView || (tracker.scrollRequest &&  ((e.touches[0].screenY > tracker.startIOSTouch && tracker.scrollView.scrollTop === 0) || (tracker.scrollView.scrollTop >= tracker.scrollEnd && e.touches[0].screenY < tracker.startIOSTouch)))) {
            e.preventDefault();
        }
        tracker = null;
    }

    function startBodyTouch(e) {
        var tracker = this.scrollTracker = this.scrollTracker || {};
        tracker.scrollView = closest(e.target, 'native-scroll');
        tracker.scrollRequest = false;
        if (!!tracker.scrollView && tracker.scrollView.firstElementChild) {
            tracker.startIOSTouch = e.touches[0].screenY;
            tracker.scrollRequest = true;
            tracker.scrollEnd = tracker.scrollView.firstElementChild.offsetHeight - tracker.scrollView.offsetHeight;
        }
        tracker = null;
    }

    function prepareEnvironment() {
        var isIOS = navigator.userAgent.match(/(iPad|iPhone|iPod|iOS)/gi) ? true : false,
            isAndroid = (/android/gi).test(window.navigator.appVersion),
            overlay = document.querySelector('#overlay');

        _.templateSettings = {
            evaluate:    /\{\{#([\s\S]+?)\}\}/g,            // {{# console.log("blah") }}
            interpolate: /\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g,  // {{ title }}
            escape:      /\{\{\{([\s\S]+?)\}\}\}/g         // {{{ title }}}
        };

        //disable text select
        document.body.onselectstart = function () {
            return false;
        };

        //setup specify device class
        if (isIOS) {
            //ios prevent scroll bounce
            window.addEventListener('touchstart', startBodyTouch, false);
            window.addEventListener('touchmove', preventBodyTouch, false);
            window.document.body.className += ' ios';
        } else if (isAndroid) {
            window.document.body.className += ' android';
        }

        //stopPropagation from overlay
        function stopProp(event) {
            event.stopPropagation();
            event.preventDefault();
        }

        overlay.addEventListener('click', stopProp, false);
        overlay.addEventListener('touchstart', stopProp, false);
        overlay.addEventListener('touchmove', stopProp, false);
        overlay.addEventListener('touchend', stopProp, false);
    }

    function modelMethod(modelID, Model, instantiate) {
        var model = Model, id = modelID;
        if (typeof Model === 'function' && (instantiate === undefined || instantiate === true)) {
            model = new Model();
        }

        if (modelID.indexOf('RAD.models.') === -1) {
            id = 'RAD.models.' + modelID;
        }

        return namespace(id, model);
    }

    function registerApp(Application, instantiate) {
        var application = Application;
        if (typeof Application === 'function' && (instantiate === undefined || instantiate === true)) {
            application = new Application(window.RAD.core);
        }
        RAD.application = application;
        return application;
    }

    //mediator
    function Mediator(core) {
        var channels = {},
            subscribe = function (channel, fn, context) {
                var id = context.viewID;

                if (!channels[channel]) {
                    channels[channel] = [];
                }
                channels[channel].push({ context: context || this, callback: fn, ID: id});

                if (core.options.debug) {
                    window.console.log(id + " subscribe to channel:" + channel, arguments);
                }
                return this;
            },

            buildName = function (parts, index) {
                var name = parts[0],
                    i;
                for (i = 1; i <= index; i += 1) {
                    name = name + '.' + parts[i];
                }

                return name;
            },

            publish = function (channel) {
                var index,
                    i,
                    l,
                    length,
                    subscription,
                    receiver,
                    publisher,
                    parts = channel.split('.'),
                    currentChannel;

                if (!window.RAD.core.isInitialize) {
                    window.RAD.core.initialize();
                }

                //prepare View if it needed
                (function (view, data) {
                    var viewID;
                    if ((parts[0] !== 'view') && (parts[0] !== 'service')) {
                        return;
                    }
                    if ((!data || !data.autocreate) && (parts[0] === 'view')) {
                        return;
                    }

                    viewID = parts[0] + '.' + parts[1];
                    core.getView(viewID, core.extractExtras(data));
                }(channel, arguments[1]));

                if (core.options.debug) {
                    publisher = this ?  this.moduleID : undefined;
                    window.console.log(publisher + " publish:", arguments);
                }

                for (index = 0, length = parts.length; index < length; index += 1) {
                    currentChannel = buildName(parts, index);

                    if (channels[currentChannel]) {
                        for (i = 0, l = channels[currentChannel].length; i < l; i += 1) {
                            subscription = channels[currentChannel][i];
                            subscription.callback.apply(subscription.context, arguments);
                            if (core.options.debug) {
                                receiver = subscription.context.options || subscription.context;
                                window.console.log("receiver:" + receiver.viewID + " channel:" + currentChannel, arguments);
                            }
                        }
                    }
                }
            },

            unsubscribe = function (channel, context) {
                var m,
                    i,
                    length,
                    id;

                if (!context) {
                    return this;
                }

                id = context.viewID;
                for (m in channels) {
                    if (channels.hasOwnProperty(m)) {
                        for (i = channels[m].length - 1, length = 0; i >= length; i -= 1) {
                            if ((channel === null || channel === m) && channels[m][i].ID === id) {
                                if (core.options.debug) {
                                    window.console.log(id + " unsubscribe from channel:" + m, arguments);
                                }
                                channels[m].splice(i, 1);
                                if (channel) {
                                    return this;
                                }
                            }
                        }
                    }
                }
                return this;
            };

        return {
            channels: function () {
                return channels;
            },
            publish: publish,
            subscribe: subscribe,
            unsubscribe: unsubscribe
        };
    }

    // core
    function Core($, document, window) {
        var self = this,
            app = {},
            viewData = {},
            mediator = new Mediator(self);

        self.options = defaultOptions;

        //work with views
        self.register = function (viewID, creator) {
            if (viewData[viewID] === undefined) {
                viewData[viewID] = {
                    creator: creator,
                    instance: null
                };
            } else {
                window.console.log('You try register already registered module:' + viewID + '!');
            }
        };

        self.registerAll = function (arrayOfViews) {
            var index, length, options, viewID;

            for (index = 0, length = arrayOfViews.length; index < length; index += 1) {
                options = arrayOfViews[index];
                for (viewID in options) {
                    if (options.hasOwnProperty(viewID)) {
                        self.register(viewID, options[viewID]);
                    }
                }
            }
        };

        self.startViewOrService = function (viewID, extras) {
            var Creator,
                view = viewData[viewID].instance;
            if (!view) {
                Creator = viewData[viewID].creator;

                if (typeof Creator !== "function") {
                    window.console.log("Sorry, but " + viewID + " wasn't registered!");
                    return;
                }

                viewData[viewID].instance = new Creator({
                    core: self,
                    application: app,
                    viewID: viewID,
                    extras: extras
                });

                if (this.options.debug) {
                    window.console.log("create: " + viewID + " with extras:", extras);
                }
            }
        };

        self.startPlugin = function (viewID) {
            var view = viewData[viewID].instance;
            if (!view) {
                viewData[viewID].instance = viewData[viewID].creator(this, viewID);
            }
            if (this.options.debug) {
                window.console.log("start plugin:", viewID);
            }
        };

        self.stop = function (viewID, callback, context) {
            var data = viewData[viewID],
                view,
                length,
                index,
                instance;
            if (data && data.instance) {
                instance = data.instance;
                if (instance instanceof window.RAD.Blanks.View) {
                    instance.unbindModel();
                }

                if (instance.children) {
                    for (index = 0, length = instance.children.length; index < length; index += 1) {
                        self.stop(instance.children[index].content, null);
                    }
                }

                window.setTimeout(function () {
                    view = viewData[viewID].instance;
                    if (!view) {
                        return;
                    }
                    mediator.unsubscribe(null, view);

                    view.destroy();
                    viewData[viewID].instance = null;

                    execute(callback, null, context);
                    if (self.options.debug) {
                        window.console.log("destroy:" + viewID);
                    }
                }, 0);
            }
        };

        self.startAll = function () {
            var viewID, parts;
            for (viewID in viewData) {
                if (viewData.hasOwnProperty(viewID)) {
                    parts = viewID.split('.');
                    if (parts[0] === 'plugin') {
                        this.startPlugin(viewID);
                    } else {
                        this.startViewOrService(viewID);
                    }
                }
            }
        };

        self.stopAll = function () {
            var viewID;
            for (viewID in viewData) {
                if (viewData.hasOwnProperty(viewID)) {
                    this.stop(viewID);
                }
            }
        };

        self.extractExtras = function (data) {
            try {
                return data.extras;
            } catch (err) {
                return null;
            }
        };

        self.getView = function (viewID, extras) {
            var view;

            if (!viewID) { return null; }
            try {
                view = viewData[viewID].instance;
            } catch (err) {
                window.console.log('Error - not register view:' + viewID, err);
                return null;
            }
            if (view === null || view === undefined) {
                self.startViewOrService(viewID, extras);
            } else if (extras) {
                try {
                    view.setExtras(extras);
                } catch (e) {
                    window.console.log(e);
                }
            }

            return viewData[viewID].instance;
        };

        self.getService = self.getView;

        self.initialize = function (application, options) {
            var viewID, parts;

            app = application || app;

            if (options) {
                self.options = options;
            }
            if (self.options.plugins && isArray(self.options.plugins)) {
                self.registerAll(self.options.plugins);
            }

            prepareEnvironment();
            for (viewID in viewData) {
                if (viewData.hasOwnProperty(viewID)) {
                    parts = viewID.split('.');
                    if (parts[0] === 'plugin') {
                        this.startPlugin(viewID);
                    }
                }
            }

            this.isInitialize = true;
        };

        self.getStartedViews = function () {
            var viewID, result = [];
            for (viewID in viewData) {
                if (viewData.hasOwnProperty(viewID) && viewData[viewID].instance) {
                    result.push(viewID);
                }
            }
            return result;
        };

        //work with events
        self.document = document;
        self.window = window;
        self.$ = $;
        self.subscribe = mediator.subscribe;
        self.publish = mediator.publish;
        self.channels = mediator.channels;
        self.unsubscribe = mediator.unsubscribe;

        return self;
    }

    window.RAD = {
        core: new Core(window.jQuery, document, window),
        model: modelMethod,
        application: registerApp,
        namespace: namespace
    };

    namespace('RAD.view', namespace('RAD.service', namespace('RAD.plugin', function (id, fabric) {
        var i, l;
        if (isArray(id)) {
            for (i = 0, l = id.length; i < l; i += 1) {
                window.RAD.core.register(id[i], fabric);
            }
        } else {
            window.RAD.core.register(id, fabric);
        }
    })));
    namespace('RAD.views', {});
    namespace('RAD.services', {});
    namespace('RAD.plugins', {});
    namespace('RAD.models', {});
    namespace('RAD.utils', {});
    namespace('RAD.scriptLoader', new ScriptLoader());
    namespace('RAD.Class', (function () {
        var self = function () {
        };

        function isFn(fn) {
            return typeof fn === "function";
        }

        self.extend = function (proto) {
            var key, k = function (magic) { // call initialize only if there's no magic cookie
                if (magic !== isFn && isFn(this.initialize)) {
                    this.initialize.apply(this, arguments);
                }
            };
            k.prototype = new this(isFn); // use our private method as magic cookie
            for (key in proto) {
                (function (fn, sfn) { // create a closure
                    k.prototype[key] = !isFn(fn) || !isFn(sfn) ? fn : // add _super method
                        function () {
                            this._super = sfn;
                            return fn.apply(this, arguments);
                        };
                }(proto[key], k.prototype[key]));
            }
            k.prototype.constructor = k;
            k.extend = this.extend || this.create;
            return k;
        };
        return self;
    }()));

}(document, window));