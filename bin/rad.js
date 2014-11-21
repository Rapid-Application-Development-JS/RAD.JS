(function (define) {
    function _require(index) {
        var module = _require.cache[index];
        if (!module) {
            var exports = {};
            module = _require.cache[index] = {
                id: index,
                exports: exports
            };
            _require.modules[index].call(exports, module, exports);
        }
        return module.exports;
    }
    _require.cache = [];
    _require.modules = [
        function (module, exports) {
            (function (name, factory) {
                if (typeof define === 'function' && define.amd) {
                    define([], factory);
                } else if (typeof exports === 'object') {
                    module.exports = factory();
                } else {
                    this[name] = factory();
                }
            }('RAD', function (define) {
                function _require(index) {
                    var module = _require.cache[index];
                    if (!module) {
                        var exports = {};
                        module = _require.cache[index] = {
                            id: index,
                            exports: exports
                        };
                        _require.modules[index].call(exports, module, exports);
                    }
                    return module.exports;
                }
                _require.cache = [];
                _require.modules = [
                    function (module, exports) {
                        var PubSub = _require(1).pubSub;
                        var ServiceLocator = _require(3).serviceLocator;
                        var execute = _require(4).execute;
                        var defaultOptions = {
                                defaultBackstack: false,
                                backstackType: 'custom',
                                defaultAnimation: 'slide',
                                animationTimeout: 3000,
                                debug: false
                            };
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
                            if (!tracker.scrollView || tracker.scrollRequest && (e.touches[0].screenY > tracker.startIOSTouch && tracker.scrollView.scrollTop === 0 || tracker.scrollView.scrollTop >= tracker.scrollEnd && e.touches[0].screenY < tracker.startIOSTouch)) {
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
                        function prepareEnvironment(options) {
                            var isIOS = navigator.userAgent.match(/(iPad|iPhone|iPod|iOS)/gi) ? true : false, isAndroid = /android/gi.test(window.navigator.appVersion);
                            options = options || {};
                            if (options.scrollBounce === undefined) {
                                options.scrollBounce = true;
                            }
                            if (options.templateSettings !== undefined) {
                                _.templateSettings = options.templateSettings;
                            }
                            if (isIOS) {
                                if (options.scrollBounce) {
                                    window.addEventListener('touchstart', startBodyTouch, false);
                                    window.addEventListener('touchmove', preventBodyTouch, false);
                                }
                                window.document.body.className += ' ios';
                            } else if (isAndroid) {
                                window.document.body.className += ' android';
                            }
                        }
                        function Core($, document, window) {
                            var self = this, app = {}, serviceLocator = new ServiceLocator(), pubsub = new PubSub();
                            self.options = defaultOptions;
                            self.initialize = function (application, options) {
                                app = application || app;
                                serviceLocator.setMixin({
                                    subscribe: pubsub.subscribe,
                                    unsubscribe: pubsub.unsubscribe,
                                    publish: pubsub.publish,
                                    application: app
                                });
                                if (options) {
                                    self.options = options;
                                }
                                pubsub.printLog(!!self.options.debug);
                                serviceLocator.printLog(!!self.options.debug);
                                if (self.options.plugins && isArray(self.options.plugins)) {
                                    self.registerAll(self.options.plugins);
                                }
                                prepareEnvironment(options);
                                this.startPlugins();
                                this.isInitialize = true;
                            };
                            self.register = function (value, obj, instantiate) {
                                serviceLocator.register(value, obj, instantiate);
                            };
                            self.registerAll = function (arrayOfServices) {
                                serviceLocator.registerAll(arrayOfServices);
                            };
                            self.getView = function (viewID, extras) {
                                var view = serviceLocator.get(viewID);
                                if (extras && view && view.setExtras) {
                                    view.setExtras(extras);
                                }
                                return view;
                            };
                            self.getService = self.getView;
                            self.startViewOrService = function (viewID, extras) {
                                var view = serviceLocator.get(viewID);
                                if (view.setExtras) {
                                    view.setExtras(extras);
                                }
                            };
                            self.startService = function (service) {
                                var result;
                                if (!service) {
                                    result = serviceLocator.instantiateAll(function (id) {
                                        return id.split('.')[0] === 'service';
                                    });
                                } else {
                                    if (Object.prototype.toString.call(service) === '[object Array]') {
                                        result = [];
                                        for (var i = 0; i < service.length; i++) {
                                            result[i] = serviceLocator.get(service[i]);
                                        }
                                    } else {
                                        result = serviceLocator.get(service);
                                    }
                                }
                                return result;
                            };
                            self.startPlugins = function () {
                                return serviceLocator.instantiateAll(function (id) {
                                    var parts = id ? id.split('.') : [];
                                    return parts[0] === 'plugin';
                                });
                            };
                            self.startAll = function (filter) {
                                return serviceLocator.instantiateAll(filter);
                            };
                            self.stop = function (viewID, callback, context) {
                                var view = this.getView(viewID), length, index;
                                if (view) {
                                    if (view.children) {
                                        for (index = 0, length = view.children.length; index < length; index += 1) {
                                            self.stop(view.children[index].content, null);
                                        }
                                    }
                                    window.setTimeout(function () {
                                        if (typeof view.destroy === 'function') {
                                            view.destroy();
                                        } else {
                                            pubsub.unsubscribe(view);
                                        }
                                        serviceLocator.removeInstance(viewID);
                                        execute(callback, null, context);
                                        if (self.options.debug) {
                                            window.console.log('destroy:', viewID);
                                        }
                                    }, 0);
                                }
                            };
                            self.stopAll = function () {
                                var views = serviceLocator.unregisterAll(), i;
                                for (i = views.length - 1; i > -1; i--) {
                                    if (typeof views[i].destroy === 'function') {
                                        views[i].destroy();
                                    } else {
                                        pubsub.unsubscribe(views[i]);
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
                            self.getAllInstantiate = function () {
                                return serviceLocator.getAllInstantiate();
                            };
                            self.document = document;
                            self.window = window;
                            self.$ = $;
                            self.channels = pubsub.channels;
                            self.subscribe = pubsub.subscribe;
                            self.unsubscribe = pubsub.unsubscribe;
                            self.publish = pubsub.publish;
                            self.getLocator = serviceLocator.getLocator;
                            return self;
                        }
                        _.templateSettings = {
                            evaluate: /\{\{#([\s\S]+?)\}\}/g,
                            interpolate: /\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g,
                            escape: /\{\{\{([\s\S]+?)\}\}\}/g
                        };
                        exports.core = Core;
                    },
                    function (module, exports) {
                        function PubSub() {
                            var channels = {}, sticky = {}, debug = false, separator = '.';
                            function log() {
                                if (debug) {
                                    window.console.log(arguments);
                                }
                            }
                            function isObject(testObj) {
                                return Object.prototype.toString.call(testObj) === '[object Object]';
                            }
                            function generateQuickGuid() {
                                return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                            }
                            function createChecker(callback, contextObject) {
                                if (callback && contextObject) {
                                    return function (subscriber, fn, context) {
                                        return subscriber.callback === fn && subscriber.context === context;
                                    };
                                }
                                if (typeof callback === 'function') {
                                    return function (subscriber, fn) {
                                        return subscriber.callback === fn;
                                    };
                                }
                                if (isObject(callback)) {
                                    return function (subscriber, context) {
                                        return subscriber.context === context;
                                    };
                                }
                                return function () {
                                };
                            }
                            return {
                                printLog: function (flag) {
                                    debug = flag;
                                    return this;
                                },
                                channels: function () {
                                    return channels;
                                },
                                setSeparator: function (sprtr) {
                                    separator = sprtr;
                                    return this;
                                },
                                publish: function (channel, data, type) {
                                    var index, i, l, length, subscription, receiver, parts = channel.split(separator), currentChannel;
                                    log(this.radID + ' publish:', arguments);
                                    if (type === 'sticky') {
                                        sticky[channel] = arguments;
                                    }
                                    for (index = 0, length = parts.length; index < length; index += 1) {
                                        currentChannel = parts.slice(0, index + 1).join(separator);
                                        if (channels[currentChannel]) {
                                            for (i = 0, l = channels[currentChannel].length; i < l; i += 1) {
                                                subscription = channels[currentChannel][i];
                                                subscription.callback.apply(subscription.context, arguments);
                                                receiver = subscription.context.options || subscription.context;
                                                log('receiver:' + receiver.radID + ' channel:' + currentChannel, arguments);
                                            }
                                        }
                                    }
                                    return this;
                                },
                                subscribe: function (channel, fn, context) {
                                    if (!channel || typeof channel != 'string') {
                                        window.console.log('Can\'t subscribe to channel, incorrect channel name:' + channel);
                                        return;
                                    }
                                    if (typeof fn != 'function') {
                                        window.console.log('Can\'t subscribe to channel, callback is not a function:' + fn);
                                        return;
                                    }
                                    var cntx = context || this, parts = channel.split(separator), index, length, currentChannel;
                                    channels[channel] = channels[channel] || [];
                                    channels[channel].push({
                                        context: cntx,
                                        callback: fn
                                    });
                                    log('subscribe to channel:' + channel, arguments);
                                    for (index = 0, length = parts.length; index < length; index += 1) {
                                        currentChannel = parts.slice(0, index + 1).join(separator);
                                        if (sticky[currentChannel]) {
                                            fn.apply(cntx, sticky[currentChannel]);
                                        }
                                    }
                                    return this;
                                },
                                unsubscribe: function (channel, fn, context) {
                                    var index, subscribers, channelName, checkSubscriber;
                                    if (arguments.length == 0) {
                                        return false;
                                    }
                                    if (typeof channel === 'string' && channels[channel]) {
                                        if (!fn && !context) {
                                            delete channels[channel];
                                            return false;
                                        }
                                        checkSubscriber = createChecker(fn, context);
                                        subscribers = channels[channel];
                                        index = subscribers.length;
                                        while (index--) {
                                            if (checkSubscriber(subscribers[index], fn, context)) {
                                                subscribers.splice(index, 1);
                                            }
                                        }
                                        if (!channels[channel].length) {
                                            delete channels[channel];
                                        }
                                        return false;
                                    }
                                    if (isObject(channel)) {
                                        context = channel;
                                        for (channelName in channels) {
                                            if (channels.hasOwnProperty(channelName)) {
                                                subscribers = channels[channelName];
                                                index = subscribers.length;
                                                while (index--) {
                                                    if (subscribers[index].context === context) {
                                                        subscribers.splice(index, 1);
                                                    }
                                                }
                                                if (!subscribers.length) {
                                                    delete channels[channelName];
                                                }
                                            }
                                        }
                                    }
                                }
                            };
                        }
                        exports.pubSub = PubSub;
                    },
                    function (module, exports) {
                        var execute = _require(4).execute;
                        function ScriptLoader() {
                            var loader = this, isLoaded = false;
                            function loadScript(url, checkCallback) {
                                if (!url || typeof url != 'string') {
                                    window.console.log('Can\'t load script, URL is incorrect:' + url);
                                    return;
                                }
                                var script = document.createElement('script');
                                script.type = 'text/javascript';
                                script.async = true;
                                if (script.readyState) {
                                    script.onreadystatechange = function () {
                                        if (script.readyState === 'loaded' || script.readyState === 'complete') {
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
                    },
                    function (module, exports) {
                        function ServiceLocator() {
                            var servicesWrap = {}, serviceMixin, debug = false;
                            function log() {
                                if (debug) {
                                    window.console.log(arguments);
                                }
                            }
                            function mix(object) {
                                var mixins = Array.prototype.slice.call(arguments, 1), key, i;
                                object.__mixins = [];
                                for (i = 0; i < mixins.length; ++i) {
                                    for (key in mixins[i]) {
                                        if (object[key] === undefined) {
                                            object[key] = mixins[i][key];
                                            object.__mixins.push(key);
                                        }
                                    }
                                }
                            }
                            function invoke(Constr, mixin, args) {
                                var instance;
                                function Temp(mixins) {
                                    var i, key;
                                    if (!mixins)
                                        return this;
                                    this.__mixins = [];
                                    for (i = 0; i < mixins.length; ++i) {
                                        for (key in mixins[i]) {
                                            this[key] = mixin[i][key];
                                            this.__mixins.push(key);
                                        }
                                    }
                                }
                                Temp.prototype = Constr.prototype;
                                Constr.prototype = new Temp(mixin);
                                instance = new Constr(args);
                                Constr.prototype = Temp.prototype;
                                return instance;
                            }
                            function deleteProp(object, propList) {
                                var j;
                                if (!object || propList.recursion > 1000)
                                    return;
                                propList.recursion += 1;
                                if (object.hasOwnProperty('__mixins')) {
                                    for (j = 0; j < propList.length; j++) {
                                        delete object[propList[j]];
                                    }
                                    delete object.__mixins;
                                } else {
                                    deleteProp(Object.getPrototypeOf(object), propList);
                                }
                            }
                            function unmix(object) {
                                object.__mixins.recursion = 0;
                                deleteProp(object, object.__mixins);
                                return object;
                            }
                            function createObj(id) {
                                log('create: ' + id);
                                return servicesWrap[id].instance = invoke(servicesWrap[id].creator, [
                                    { radID: id },
                                    serviceMixin
                                ]);
                            }
                            return {
                                printLog: function (flag) {
                                    debug = flag;
                                    return this;
                                },
                                setMixin: function (obj) {
                                    serviceMixin = obj;
                                    return this;
                                },
                                getLocator: function () {
                                    return servicesWrap;
                                },
                                register: function (value, obj, instantiate) {
                                    function track(id) {
                                        if (servicesWrap[id] === undefined) {
                                            if (typeof obj === 'function' && (instantiate === true || instantiate === undefined)) {
                                                servicesWrap[id] = { creator: obj };
                                            } else {
                                                mix(obj, { radID: id }, serviceMixin);
                                                servicesWrap[id] = { instance: obj };
                                            }
                                        } else {
                                            log('You try register already registered module:' + id + '!');
                                        }
                                    }
                                    if (Object.prototype.toString.call(value) === '[object Array]') {
                                        for (var i = value.length - 1; i > -1; i--) {
                                            track(value[i]);
                                        }
                                    } else {
                                        track(value);
                                    }
                                    return this;
                                },
                                registerAll: function (arrayOfServices) {
                                    var i, service, radID, obj, instantiate;
                                    for (i = 0; i < arrayOfServices.length; ++i) {
                                        service = arrayOfServices[i];
                                        radID = service.radID || service.ID || service.id;
                                        obj = service.service || service.obj || service.object || service.creator;
                                        instantiate = service.instantiate !== undefined ? !!service.instantiate : true;
                                        this.register(radID, obj, instantiate);
                                    }
                                    return this;
                                },
                                get: function (id) {
                                    if (servicesWrap[id] === undefined) {
                                        log('Error - ' + id + ' is not registered!');
                                        return null;
                                    }
                                    return servicesWrap[id].instance || createObj(id);
                                },
                                instantiateAll: function (filter) {
                                    var radID, result = [];
                                    filter = filter || function () {
                                        return true;
                                    };
                                    for (radID in servicesWrap) {
                                        if (servicesWrap.hasOwnProperty(radID) && servicesWrap[radID].creator && !servicesWrap[radID].instance && filter(radID)) {
                                            result.push(createObj(radID));
                                        }
                                    }
                                    return result;
                                },
                                getAllInstantiate: function (withConstructor) {
                                    var radID, result = [], flag;
                                    for (radID in servicesWrap) {
                                        flag = withConstructor ? !!servicesWrap[radID].creator : true;
                                        if (servicesWrap.hasOwnProperty(radID) && servicesWrap[radID].instance && servicesWrap[radID].creator) {
                                            result.push(radID);
                                        }
                                    }
                                    return result;
                                },
                                removeInstance: function (id) {
                                    if (!servicesWrap[id] || !servicesWrap[id].instance) {
                                        return false;
                                    }
                                    delete servicesWrap[id].instance;
                                },
                                unregister: function (value, removeMixin) {
                                    var result, i;
                                    function remove(id) {
                                        var serviceData, instance;
                                        serviceData = servicesWrap[id];
                                        if (removeMixin && serviceData && serviceData.instance) {
                                            instance = serviceData.instance;
                                            unmix(instance);
                                        }
                                        delete servicesWrap[id];
                                        return serviceData.instance;
                                    }
                                    if (Object.prototype.toString.call(value) === '[object Array]') {
                                        result = [];
                                        for (i = value.length - 1; i > -1; i--) {
                                            result.push(remove(value[i]));
                                        }
                                    } else {
                                        result = remove(value);
                                    }
                                    return result;
                                },
                                unregisterAll: function (removeMixins) {
                                    var id, result = [], instance;
                                    for (id in servicesWrap) {
                                        if (servicesWrap.hasOwnProperty(id)) {
                                            instance = this.unregister(id, removeMixins);
                                            if (instance)
                                                result.push(instance);
                                        }
                                    }
                                    return result;
                                }
                            };
                        }
                        exports.serviceLocator = ServiceLocator;
                    },
                    function (module, exports) {
                        function execute(func, args, context) {
                            if (typeof func !== 'function') {
                                return;
                            }
                            if (context && context instanceof Object) {
                                func.apply(context, args);
                            } else {
                                func(args);
                            }
                        }
                        function isArray(value) {
                            return Object.prototype.toString.call(value) === '[object Array]';
                        }
                        exports.isArray = isArray;
                        exports.execute = execute;
                    },
                    function (module, exports) {
                        var ScriptLoader = _require(2).scriptLoader;
                        var Core = _require(0).core;
                        function execute(func, args, context) {
                            if (typeof func !== 'function') {
                                return;
                            }
                            if (context && context instanceof Object) {
                                func.apply(context, args);
                            } else {
                                func(args);
                            }
                        }
                        function isArray(value) {
                            return Object.prototype.toString.call(value) === '[object Array]';
                        }
                        function namespace(destination, obj) {
                            if (typeof destination !== 'string') {
                                window.console.log('Can\'t create namespace, destination or object specified incorrectly:' + destination);
                                return;
                            }
                            var parts = destination.split('.'), parent = window.RAD, pl, i;
                            if (parts[0] === 'RAD') {
                                parts = parts.slice(1);
                            }
                            pl = parts.length;
                            for (i = 0; i < pl; i += 1) {
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
                        function closest(element, className) {
                            var result, el;
                            el = element;
                            while (!result && el != null) {
                                if (el.classList && el.classList.contains(className)) {
                                    result = el;
                                } else if (el.className && el.className.indexOf(className) >= 0) {
                                    result = el;
                                }
                                el = el.parentNode;
                            }
                            return result;
                        }
                        function preventBodyTouch(e) {
                            var tracker = this.scrollTracker;
                            if (!tracker.scrollView || tracker.scrollRequest && (e.touches[0].screenY > tracker.startIOSTouch && tracker.scrollView.scrollTop === 0 || tracker.scrollView.scrollTop >= tracker.scrollEnd && e.touches[0].screenY < tracker.startIOSTouch)) {
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
                        function modelMethod(modelID, model, instantiate) {
                            var modelInstance = model, id = modelID;
                            if (typeof model === 'function' && (instantiate === undefined || instantiate === true)) {
                                modelInstance = new model();
                            }
                            if (modelID.indexOf('RAD.models.') === -1) {
                                id = 'RAD.models.' + modelID;
                            }
                            return namespace(id, modelInstance);
                        }
                        function registerApp(application, instantiate) {
                            var app = application;
                            if (typeof application === 'function' && (instantiate === undefined || instantiate === true)) {
                                app = new application(window.RAD.core);
                            }
                            RAD.application = app;
                            return app;
                        }
                        var reg = function (id, fabric, instantiate) {
                            var i, l;
                            if (isArray(id)) {
                                for (i = 0, l = id.length; i < l; i += 1) {
                                    window.RAD.core.register(id[i], fabric, instantiate);
                                }
                            } else {
                                window.RAD.core.register(id, fabric, instantiate);
                            }
                        };
                        function init() {
                            namespace('RAD.view', reg);
                            namespace('RAD.service', reg);
                            namespace('RAD.plugin', reg);
                            namespace('RAD.views', {});
                            namespace('RAD.services', {});
                            namespace('RAD.plugins', {});
                            namespace('RAD.models', {});
                            namespace('RAD.utils', {});
                            namespace('RAD.scriptLoader', new ScriptLoader());
                        }
                        exports.core = new Core(window.jQuery, document, window);
                        exports.model = modelMethod;
                        exports.application = registerApp;
                        exports.namespace = namespace;
                        exports.init = init;
                    }
                ];
                return _require(5);
            }));
        },
        function (module, exports) {
            window.RAD = _require(0);
            window.RAD.init();
            var blanks = [];
            var animate_transition_plugin = _require(8);
            blanks.push(animate_transition_plugin);
            var navigator = _require(10);
            blanks.push(navigator);
            var router = _require(12);
            blanks.push(router);
            var pointer_plugin = _require(11);
            blanks.push(pointer_plugin);
            var gesture_plugin = _require(9);
            blanks.push(gesture_plugin);
            var deferred = _require(3);
            blanks.push(deferred);
            var plugin = _require(4);
            blanks.push(plugin);
            var service = _require(6);
            blanks.push(service);
            var view = _require(7);
            blanks.push(view);
            var scrollable_view = _require(5);
            blanks.push(scrollable_view);
            for (var i = 0; i < blanks.length; i++) {
                RAD[blanks[i].type](blanks[i].namespace, blanks[i].module);
            }
        },
        function (module, exports) {
            var cl = function () {
                    var self = function () {
                    };
                    function isFn(fn) {
                        return typeof fn === 'function';
                    }
                    self.extend = function (proto) {
                        var key, k = function (magic) {
                                if (magic !== isFn && isFn(this.initialize)) {
                                    this.initialize.apply(this, arguments);
                                }
                            };
                        k.prototype = new this(isFn);
                        for (key in proto) {
                            (function (fn, sfn) {
                                k.prototype[key] = !isFn(fn) || !isFn(sfn) ? fn : function () {
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
                }();
            exports.namespace = 'RAD.Class';
            exports.module = cl;
            exports.type = 'namespace';
        },
        function (module, exports) {
            var def = function () {
                return {
                    listeners: [],
                    done: function (fn) {
                        this.listeners.push(fn);
                    },
                    doneFirstTask: function (fn) {
                        this.firstTask = fn;
                    },
                    doneLastTask: function (fn) {
                        this.lastTask = fn;
                    },
                    resolve: function () {
                        var self = this, index, length, fn;
                        self.resolve = function () {
                        };
                        self.done = function (fn) {
                            if (typeof fn === 'function') {
                                fn();
                            }
                        };
                        self.doneLastTask = self.doneFirstTask = self.done;
                        if (typeof self.firstTask === 'function') {
                            self.firstTask();
                        }
                        for (index = 0, length = self.listeners.length; index < length; index += 1) {
                            fn = self.listeners[index];
                            if (typeof fn === 'function') {
                                fn();
                            }
                        }
                        if (typeof self.lastTask === 'function') {
                            self.lastTask();
                        }
                        delete self.listeners;
                    }
                };
            };
            exports.namespace = 'RAD.Blanks.Deferred';
            exports.module = def;
            exports.type = 'namespace';
        },
        function (module, exports) {
            var radClass = _require(2).module;
            var blankPlugin = radClass.extend({
                    initialize: function () {
                        this.subscribe(this.radID, this.onReceiveMsg, this);
                        this.onInitialize();
                    },
                    destroy: function () {
                        this.onDestroy();
                        this.unsubscribe(this);
                    },
                    onInitialize: function () {
                    },
                    onReceiveMsg: function () {
                    },
                    onDestroy: function () {
                    }
                });
            exports.namespace = 'RAD.Blanks.Plugin';
            exports.module = blankPlugin;
            exports.type = 'namespace';
        },
        function (module, exports) {
            var view = _require(7).module;
            console.log(view);
            var scrollable = view.extend({
                    className: 'scroll-view',
                    onrender: function () {
                        this.refreshScroll();
                    },
                    onattach: function () {
                        var self = this;
                        this.attachScroll();
                        this.el.addEventListener('scrollRefresh', function (e) {
                            self.mScroll.refresh();
                            e.stopPropagation();
                        });
                    },
                    ondetach: function () {
                        this.el.removeEventListener('scrollRefresh');
                        this.detachScroll();
                    },
                    refreshScroll: function () {
                        var wrapper;
                        if (!this.mScroll) {
                            return;
                        }
                        wrapper = this.el.querySelector('.scroll-view') || this.el;
                        if (this.mScroll.wrapper === wrapper && this.mScroll.scroller === wrapper.children[0]) {
                            this.mScroll.refresh();
                        } else {
                            this.detachScroll();
                            this.attachScroll();
                        }
                    },
                    attachScroll: function () {
                        var wrapper = this.el.querySelector('.scroll-view') || this.el, options = this.scrollOptions ? this.scrollOptions : {};
                        options.onBeforeScrollStart = function (e) {
                            var regExp = /^(INPUT|TEXTAREA|BUTTON|SELECT)$/;
                            if (!regExp.test(e.target.tagName)) {
                                e.preventDefault();
                            }
                        };
                        this.mScroll = new window.iScroll(wrapper, options);
                    },
                    detachScroll: function () {
                        this.mScroll.destroy();
                        this.mScroll = null;
                    }
                });
            exports.namespace = 'RAD.Blanks.ScrollableView';
            exports.module = scrollable;
            exports.type = 'namespace';
        },
        function (module, exports) {
            var radClass = _require(2).module;
            var service = radClass.extend({
                    initialize: function () {
                        this.subscribe(this.radID, this.onReceiveMsg, this);
                        this.onInitialize();
                    },
                    destroy: function () {
                        this.onDestroy();
                        this.unsubscribe(this);
                    },
                    onInitialize: function () {
                    },
                    onReceiveMsg: function () {
                    },
                    onDestroy: function () {
                    }
                });
            exports.namespace = 'RAD.Blanks.Service';
            exports.module = service;
            exports.type = 'namespace';
        },
        function (module, exports) {
            var deferred = _require(3).module;
            var view = Backbone.View.extend({
                    className: 'backbone-view',
                    attributes: { 'data-role': 'view' },
                    listen: [
                        'add',
                        'remove',
                        'fetch',
                        'sort',
                        'change',
                        'reset'
                    ],
                    getChildren: function () {
                        if (!this.children) {
                            this.children = [];
                        }
                        return this.children;
                    },
                    initialize: function () {
                        var self = this;
                        self.loader = deferred();
                        self.renderRequest = true;
                        self.viewID = this.radID;
                        self.finish = function () {
                            RAD.core.stop(self.viewID);
                        };
                        self.getChildren();
                        if (typeof self.template === 'function') {
                            self.bindModel(self.model);
                            self.loader.resolve();
                        } else if (window.JST && window.JST[self.url]) {
                            self.template = window.JST[self.url];
                            self.bindModel(self.model);
                            self.loader.resolve();
                        } else {
                            self.ajax = $.get(self.url, function (data) {
                                if (self.ajax) {
                                    self.template = _.template(data);
                                    self.bindModel(self.model);
                                    self.loader.resolve();
                                }
                                self.ajax = null;
                            }, 'text');
                        }
                        self.subscribe(self.radID, self.receiveMsg, self);
                        self.oninit();
                        self.onInitialize();
                        return self;
                    },
                    setExtras: function (extras) {
                        if (extras !== this.extras) {
                            this.onNewExtras(extras);
                            this.extras = extras;
                        }
                    },
                    bindModel: function (model) {
                        var self = this, i;
                        if (model) {
                            self.model = model;
                            for (i = this.listen.length - 1; i > -1; i -= 1) {
                                self.listenTo(model, self.listen[i], self.render);
                            }
                            if (self.template && !self.renderRequest) {
                                model.trigger('change');
                            }
                        }
                    },
                    unbindModel: function (forceRender) {
                        if (this.model) {
                            this.stopListening(this.model);
                            this.model = null;
                            if (forceRender) {
                                this.render();
                            }
                        }
                    },
                    changeModel: function (newModel) {
                        var self = this;
                        self.unbindModel();
                        self.bindModel(newModel);
                    },
                    insertSubview: function (data, callback) {
                        var content = RAD.core.getView(data.content, data.extras), container = this.el.querySelector(data.container_id);
                        if (data && data.backstack) {
                            RAD.core.publish('router.beginTransition', data);
                        }
                        content.appendIn(container, function () {
                            container.setAttribute('view', data.content);
                            if (typeof data.callback === 'function') {
                                if (typeof data.context === 'object') {
                                    data.callback.call(data.context);
                                } else {
                                    data.callback();
                                }
                            }
                            if (typeof callback === 'function') {
                                callback();
                            }
                        });
                    },
                    render: function (callback) {
                        var virtualEl = document.createElement('div'), virtualTemplates, self = this, json, children = self.getChildren(), counter = children.length, childView, index, length;
                        function check() {
                            counter -= 1;
                            if (counter <= 0) {
                                self.onrender();
                                self.onEndRender();
                                self.dispatchScrollRefresh();
                                self.renderRequest = false;
                                if (typeof callback === 'function') {
                                    callback();
                                }
                            }
                        }
                        function prepareInnerTemplates() {
                            var templates, i, length;
                            if (self.innerTemplates === false) {
                                return;
                            }
                            templates = self.el.querySelectorAll('[data-template]');
                            if (templates.length) {
                                self.innerTemplates = [];
                                for (i = 0, length = templates.length; i < length; i++) {
                                    self.innerTemplates[i] = templates[i];
                                }
                            } else {
                                self.innerTemplates = false;
                            }
                        }
                        self.onStartRender();
                        for (index = 0, length = children.length; index < length; index += 1) {
                            childView = RAD.core.getView(children[index].content, children[index].extras);
                            if (childView) {
                                childView.detach();
                            } else {
                                window.console.log('Child view [' + children[index].content + '] is not registered. Please check parent view [' + self.radID + '] ');
                                return;
                            }
                        }
                        json = self.model ? self.model.toJSON() : undefined;
                        try {
                            if (self.innerTemplates && !self.renderRequest) {
                                virtualEl.innerHTML = self.template({
                                    model: json,
                                    view: self
                                });
                                virtualTemplates = virtualEl.querySelectorAll('[data-template]');
                                for (index = 0, length = self.innerTemplates.length; index < length; index++) {
                                    self.innerTemplates[index].parentNode.replaceChild(virtualTemplates[index], self.innerTemplates[index]);
                                    self.innerTemplates[index] = virtualTemplates[index];
                                }
                            } else {
                                self.el.innerHTML = self.template({
                                    model: json,
                                    view: self
                                });
                                prepareInnerTemplates();
                            }
                        } catch (e) {
                            window.console.log(e.message + '. Caused during rendering: ' + self.radID);
                            return;
                        }
                        if (children.length > 0) {
                            for (index = 0, length = children.length; index < length; index += 1) {
                                childView = RAD.core.getView(children[index].content, children[index].extras);
                                if (childView) {
                                    this.insertSubview(children[index], check);
                                } else {
                                    window.console.log('Cannot insert child view [' + children[index].content + ']. It is not registered. Please check parent view [' + self.radID + '] ');
                                    return;
                                }
                            }
                        } else {
                            check();
                        }
                        return self;
                    },
                    appendIn: function (container, callback) {
                        var self = this;
                        if (!container) {
                            window.console.log('Cannot insert view [' + self.radID + ']. Target container does not exist');
                            return;
                        }
                        container.appendChild(this.el);
                        if (this.renderRequest) {
                            this.loader.doneFirstTask(function () {
                                self.render(callback);
                            });
                        } else {
                            callback();
                        }
                    },
                    dispatchScrollRefresh: function (target) {
                        var el = target || this.el, event = document.createEvent('Event');
                        if (el.parentNode) {
                            event.initEvent('scrollRefresh', true, true);
                            el.parentNode.dispatchEvent(event);
                        }
                    },
                    receiveMsg: function msgFunc(msg, data) {
                        var self = this, parts = msg.split('.');
                        switch (parts[parts.length - 1]) {
                        case 'attach_start':
                            self.loader.done(function () {
                                self.onBeforeAttach();
                            });
                            break;
                        case 'attach':
                            self.loader.done(function () {
                                self.onattach();
                                self.onStartAttach(msg, data);
                            });
                            break;
                        case 'attach_complete':
                            self.loader.doneLastTask(function () {
                                self.onEndAttach(msg, data);
                            });
                            break;
                        case 'detach':
                            self.ondetach();
                            self.onEndDetach(msg, data);
                            break;
                        default:
                            self.onReceiveMsg(msg, data);
                            break;
                        }
                        return self;
                    },
                    detach: function () {
                        if (this.$el) {
                            this.$el.detach();
                        }
                    },
                    destroy: function () {
                        var property, self = this;
                        if (self.ajax) {
                            self.ajax.abort();
                            self.ajax = null;
                        }
                        self.onDestroy();
                        self.ondestroy();
                        self.unbindModel();
                        self.off(null, null, self);
                        self.unsubscribe(self);
                        self.undelegateEvents();
                        self.$el.removeData().off();
                        self.$el.parent().removeAttr('view');
                        self.remove();
                        for (property in self) {
                            if (self.hasOwnProperty(property)) {
                                delete self[property];
                            }
                        }
                        return this;
                    },
                    oninit: function () {
                    },
                    onattach: function () {
                    },
                    ondetach: function () {
                    },
                    onrender: function () {
                    },
                    ondestroy: function () {
                    },
                    onInitialize: function () {
                    },
                    onNewExtras: function () {
                    },
                    onReceiveMsg: function () {
                    },
                    onStartRender: function () {
                    },
                    onEndRender: function () {
                    },
                    onBeforeAttach: function () {
                    },
                    onStartAttach: function () {
                    },
                    onEndAttach: function () {
                    },
                    onEndDetach: function () {
                    },
                    onDestroy: function () {
                    }
                });
            exports.namespace = 'RAD.Blanks.View';
            exports.module = view;
            exports.type = 'namespace';
        },
        function (module, exports) {
            var blankPlugin = _require(4).module, animateTransition = _require(13).module;
            var animateTransitionPlugin = blankPlugin.extend({
                    onInitialize: function () {
                        this.subscribe('animateTransition', this.applyTransition, this);
                    },
                    applyTransition: function (channel, data) {
                        if (data) {
                            animateTransition(data);
                        }
                    }
                });
            exports.namespace = 'plugin.animateTransition';
            exports.module = animateTransitionPlugin;
            exports.type = 'plugin';
        },
        function (module, exports) {
            var blankPlugin = _require(4).module, gesture = _require(15).module;
            var GesturePlugin = blankPlugin.extend({
                    onInitialize: function () {
                        this.gesture = new gesture(document.body);
                    },
                    onDestroy: function () {
                        this.gesture.destroy();
                        this.gesture = null;
                    }
                });
            exports.namespace = 'plugin.gesture';
            exports.module = GesturePlugin;
            exports.type = 'plugin';
        },
        function (module, exports) {
            function Navigator() {
                var self = this, core = RAD.core, id = this.radID, defaultBackstack = core.options && core.options.defaultBackstack !== undefined ? core.options.defaultBackstack : false;
                function getSubviewsID(view) {
                    var i, j, children, index, length, childID, views, result = [];
                    if (!view) {
                        return result;
                    }
                    children = view.getChildren();
                    for (index = 0, length = children.length; index < length; index += 1) {
                        childID = children[index].content;
                        result.push(childID);
                        views = getSubviewsID(core.getView(childID));
                        for (i = 0, j = views.length; i < j; i += 1) {
                            result.push(views[i]);
                        }
                    }
                    return result;
                }
                function publishToGroup(msg, subscrabers) {
                    var i, l;
                    for (i = 0, l = subscrabers.length; i < l; i += 1) {
                        core.publish(subscrabers[i] + '.' + msg);
                    }
                }
                function setupPopupPosition(popup, target, gravity, width, height) {
                    var winW = window.innerWidth, winH = window.innerHeight, popupW = width || popup.clientWidth, popupH = height || popup.clientHeight, popupX = 0, popupY = 0, $target = target ? $(target) : $(document.body), targetY = $target.offset().top, targetX = $target.offset().left, targetW = $target.outerWidth(), targetH = $target.outerHeight(), nullTargetOffsetX = target ? 0 : popupW, nullTargetOffsetY = target ? 0 : popupH, gravityEnable = gravity && 'top bottom left right center'.indexOf(gravity) !== -1, popupStyle = window.getComputedStyle(popup), pointer = popup.querySelector('.popup-pointer'), pointerOffsetLeft = 0, pointerOffsetTop = 0;
                    function inRect(left, top, right, bottom, width, height) {
                        return width < right - left && height < bottom - top;
                    }
                    if (!gravityEnable) {
                        gravity = 'center';
                        if (inRect(0, 0, targetX, winH, popupW, popupH)) {
                            gravity = 'left';
                        }
                        if (inRect(0, targetY + targetH, winW, winH, popupW, popupH)) {
                            gravity = 'bottom';
                        }
                        if (inRect(targetX + targetW, 0, winW, winH, popupW, popupH)) {
                            gravity = 'right';
                        }
                        if (inRect(0, 0, winW, targetY, popupW, popupH)) {
                            gravity = 'top';
                        }
                    }
                    switch (gravity) {
                    case 'center':
                        popupX = (winW - popupW) / 2;
                        popupY = (winH - popupH) / 2;
                        break;
                    case 'top':
                        popupX = targetX - popupW / 2 + targetW / 2;
                        popupY = targetY - popupH + nullTargetOffsetY;
                        break;
                    case 'bottom':
                        popupX = targetX - popupW / 2 + targetW / 2;
                        popupY = targetY + targetH - nullTargetOffsetY;
                        break;
                    case 'left':
                        popupY = targetY - popupH / 2 + targetH / 2;
                        popupX = targetX - popupW + nullTargetOffsetX;
                        break;
                    case 'right':
                        popupY = targetY - popupH / 2 + targetH / 2;
                        popupX = targetX + targetW - nullTargetOffsetX;
                        break;
                    default:
                        break;
                    }
                    popup.style.left = Math.round(popupX + window.pageXOffset) + 'px';
                    popup.style.top = Math.round(popupY + window.pageYOffset) + 'px';
                    popup.style.width = width + 'px';
                    popup.style.height = height + 'px';
                    if (pointer) {
                        pointer.style.top = '';
                        pointer.style.left = '';
                        pointer.className = 'popup-pointer ' + gravity;
                        if (gravity === 'top' || gravity === 'bottom') {
                            pointerOffsetLeft = pointer.offsetWidth / 2 + parseInt(popupStyle.paddingLeft, 10);
                            pointer.style.left = targetX + Math.round(target.offsetWidth / 2) - popupX - pointerOffsetLeft + 'px';
                        }
                        if (gravity === 'left' || gravity === 'right') {
                            pointerOffsetTop = pointer.offsetHeight / 2 + parseInt(popupStyle.paddingTop, 10);
                            pointer.style.top = targetY + Math.round(target.offsetHeight / 2) - popupY - pointerOffsetTop + 'px';
                        }
                    }
                }
                function getParentViewIDForSelector(selector) {
                    var result;
                    function recursion(element) {
                        if (!element || !element.parentNode) {
                            return null;
                        }
                        element = element.parentNode;
                        if (element && element.getAttribute) {
                            result = element.getAttribute('view');
                            if (result) {
                                return result;
                            } else {
                                return recursion(element);
                            }
                        }
                    }
                    return typeof selector === 'string' ? recursion(core.document.querySelector(selector)) : null;
                }
                function updateChildren(datawrapper) {
                    var parentViewID = getParentViewIDForSelector(datawrapper.container_id), parentView, children, newChildOptions, index, length, child;
                    if (parentViewID) {
                        parentView = core.getView(parentViewID);
                        children = parentView.getChildren();
                        newChildOptions = {
                            container_id: datawrapper.container_id,
                            content: datawrapper.content,
                            animation: datawrapper.animation
                        };
                        if (children) {
                            for (index = 0, length = children.length; index < length; index += 1) {
                                child = children[index];
                                if (child.container_id === newChildOptions.container_id) {
                                    children.splice(index, 1);
                                    break;
                                }
                            }
                        }
                        children.push(newChildOptions);
                    }
                }
                function renderView(view, callback) {
                    if (view && view.renderRequest) {
                        view.loader.doneFirstTask(function () {
                            view.render(callback);
                        });
                    } else {
                        if (typeof callback === 'function') {
                            callback();
                        }
                    }
                }
                function navigateView(data) {
                    var animation, container, oldViewId, newViewId, oldView, newView, detachedViews, attachedViews, attachViews;
                    animation = data.animation || core.options.defaultAnimation;
                    if (animation !== 'none' && animation.indexOf('-in') === -1 && animation.indexOf('-out') === -1) {
                        if (data.direction) {
                            animation += '-out';
                        } else {
                            animation += '-in';
                        }
                    }
                    container = data.container_id.tagName ? data.container_id : document.querySelector(data.container_id);
                    oldViewId = container.getAttribute('view');
                    oldView = core.getView(oldViewId);
                    newViewId = data.content;
                    newView = core.getView(newViewId, core.extractExtras(data));
                    if (newViewId && !newView) {
                        window.console.log('View not found:' + newViewId);
                    }
                    detachedViews = getSubviewsID(oldView);
                    attachedViews = getSubviewsID(newView);
                    detachedViews.push(oldViewId);
                    attachedViews.push(newViewId);
                    if (oldViewId === newViewId) {
                        window.console.log('You try to navigate the same view:' + newViewId);
                        if (data && data.callback)
                            data.callback(data, newView ? newView.el : null, oldView ? oldView.el : null, container);
                        return;
                    }
                    attachViews = function () {
                        publishToGroup('attach_start', attachedViews);
                        container.setAttribute('view', newViewId);
                        core.publish('animateTransition', {
                            container: container,
                            pageIn: newView ? newView.el : null,
                            pageOut: oldView ? oldView.el : null,
                            animation: animation,
                            beforeTransition: function () {
                                if (data.beforeTransition) {
                                    return data.beforeTransition.apply(arguments);
                                }
                            },
                            onTransitionStart: function () {
                                publishToGroup('attach', attachedViews);
                            },
                            onTransitionEnd: function (pageIn, pageOut, container) {
                                updateChildren(data);
                                publishToGroup('detach', detachedViews);
                                publishToGroup('attach_complete', attachedViews);
                                if (typeof data.callback === 'function') {
                                    data.callback(data, pageIn, pageOut, container);
                                }
                                core.publish('router.endTransition', data);
                            }
                        });
                    };
                    renderView(newView, attachViews);
                }
                function stopPropagation(e) {
                    e.stopPropagation();
                }
                function showSingle(data) {
                    var viewId, view, attachView;
                    viewId = data.content;
                    view = core.getView(viewId, data.extras);
                    data.animation = data.animation || 'fade';
                    view.el.animation = data.animation;
                    if (view.el.timeout) {
                        window.clearTimeout(view.el.timeout);
                    }
                    if (view.el.onCloseListener) {
                        view.el.removeEventListener('click', stopPropagation, false);
                        document.body.removeEventListener('click', view.el.onCloseListener, false);
                        view.el.onCloseListener = null;
                    }
                    attachView = function () {
                        core.publish(viewId + '.attach_start');
                        core.publish('animateTransition', {
                            pageIn: view.el,
                            animation: data.animation + '-in',
                            onTransitionStart: function () {
                                setupPopupPosition(view.el, data.target, data.gravity, data.width, data.height);
                                core.publish(viewId + '.attach');
                            },
                            onTransitionEnd: function () {
                                core.publish(viewId + '.attach_complete');
                                if (typeof data.showTime === 'number') {
                                    view.el.timeout = window.setTimeout(function () {
                                        closeSingle({ content: viewId });
                                    }, data.showTime);
                                }
                                if (data.outsideClose) {
                                    view.el.onCloseListener = function (e) {
                                        closeSingle({ content: viewId });
                                    };
                                    view.el.addEventListener('click', stopPropagation, false);
                                    document.body.addEventListener('click', view.el.onCloseListener, false);
                                }
                            }
                        });
                    };
                    renderView(view, attachView);
                }
                function closeSingle(data) {
                    var viewId, view;
                    viewId = data.content;
                    view = core.getView(viewId);
                    if (view.el.timeout) {
                        window.clearTimeout(view.el.timeout);
                    }
                    if (view.el.onCloseListener) {
                        view.el.removeEventListener('click', stopPropagation, false);
                        document.body.removeEventListener('click', view.el.onCloseListener, false);
                        view.el.onCloseListener = null;
                    }
                    core.publish('animateTransition', {
                        pageOut: view.el,
                        animation: view.el.animation + '-out',
                        onTransitionEnd: function () {
                            core.publish(viewId + '.detach');
                        }
                    });
                }
                function showWindow(data) {
                    var container = document.createElement('div'), className = data.className || 'modal-container';
                    if (data.position) {
                        className += ' pos-' + data.position;
                    } else {
                        className += ' pos-center-center';
                    }
                    if (data.outsideClose) {
                        container.listener = function (e) {
                            if (e.target === container) {
                                closeWindow({ content: data.content });
                            }
                        };
                        container.addEventListener('click', container.listener, false);
                    }
                    data.animation = data.animation || 'none';
                    data.container_id = container;
                    container.className = className;
                    container.animation = data.animation;
                    data.beforeTransition = function () {
                        document.body.appendChild(container);
                    };
                    navigateView(data);
                }
                function closeWindow(data) {
                    var container = document.querySelector('[view="' + data.content + '"]'), closeAnimation;
                    if (!container) {
                        return;
                    }
                    closeAnimation = container.animation && container.animation !== 'none' ? container.animation + '-out' : 'none';
                    data.animation = data.animation || closeAnimation;
                    data.container_id = container;
                    data.content = '';
                    data.callback = function (data, pageIn, pageOut, container) {
                        document.body.removeChild(container);
                    };
                    if (container.listener) {
                        container.removeEventListener('click', container.listener);
                        container.listener = null;
                    }
                    navigateView(data);
                }
                function onNavigationEvent(channel, data) {
                    var parts = channel.split('.');
                    switch (parts[1]) {
                    case 'show':
                        if (data.backstack || defaultBackstack) {
                            core.publish('router.beginTransition', data);
                        }
                        navigateView(data);
                        break;
                    case 'back':
                        data.direction = data.direction !== undefined ? data.direction : true;
                        navigateView(data);
                        break;
                    case 'dialog':
                        if (parts[2] === 'show') {
                            showWindow(data);
                        }
                        if (parts[2] === 'close') {
                            closeWindow(data);
                        }
                        break;
                    case 'toast':
                    case 'popup':
                        if (parts[2] === 'show') {
                            showSingle(data);
                        }
                        if (parts[2] === 'close') {
                            closeSingle(data);
                        }
                        break;
                    }
                }
                core.subscribe('navigation', onNavigationEvent, self);
                self.viewID = id;
                self.destroy = function () {
                    core.unsubscribe(self);
                };
            }
            exports.namespace = 'plugin.navigator';
            exports.module = Navigator;
            exports.type = 'plugin';
        },
        function (module, exports) {
            var blankPlugin = _require(4).module, pointer = _require(16).module;
            var PointerPlugin = blankPlugin.extend({
                    onInitialize: function () {
                        if (!window.PointerEvent) {
                            this.gesture = new pointer(document.body);
                        }
                    },
                    onDestroy: function () {
                        this.gesture.destroy();
                        this.gesture = null;
                    }
                });
            exports.namespace = 'plugin.pointer';
            exports.module = PointerPlugin;
            exports.type = 'plugin';
        },
        function (module, exports) {
            var blankPlugin = _require(4).module, backStack = _require(14).module;
            var router = blankPlugin.extend({
                    onInitialize: function () {
                        this.backStack = new backStack(RAD.core, this.radID);
                    },
                    onDestroy: function () {
                        this.backStack.destroy();
                        this.backStack = null;
                    }
                });
            exports.namespace = 'plugin.router';
            exports.module = router;
            exports.type = 'plugin';
        },
        function (module, exports) {
            var animateTransition = function () {
                    'use strict';
                    var prefixes = [
                            'webkit',
                            'moz',
                            'MS',
                            'o',
                            ''
                        ], overlay = document.createElement('div');
                    overlay.className = 'transition-overlay';
                    function showOverlay() {
                        document.body.appendChild(overlay);
                    }
                    function hideOverlay() {
                        if (overlay.parentNode) {
                            document.body.removeChild(overlay);
                        }
                    }
                    function getElement(selector) {
                        if (!selector) {
                            return null;
                        }
                        return selector.tagName ? selector : document.querySelector(selector);
                    }
                    function addPrefixedEvent(element, eventName, callback) {
                        for (var i = 0; i < prefixes.length; i++) {
                            if (!prefixes[i]) {
                                eventName = eventName.toLowerCase();
                            }
                            element.addEventListener(prefixes[i] + eventName, callback, false);
                        }
                    }
                    function removePrefixedEvent(element, eventName, callback) {
                        for (var i = 0; i < prefixes.length; i++) {
                            if (!prefixes[i]) {
                                eventName = eventName.toLowerCase();
                            }
                            element.removeEventListener(prefixes[i] + eventName, callback, false);
                        }
                    }
                    function hasClass(obj, cname) {
                        return obj.className ? obj.className.match(new RegExp('(\\s|^)' + cname + '(\\s|$)')) : false;
                    }
                    function addClass(obj, cname) {
                        if (obj && !hasClass(obj, cname)) {
                            obj.className += ' ' + cname;
                        }
                    }
                    function removeClass(obj, cname) {
                        if (obj && hasClass(obj, cname)) {
                            obj.className = obj.className.replace(new RegExp('(\\s|^)' + cname + '(?=\\s|$)'), '');
                        }
                    }
                    function getFakeEventObj(name) {
                        return {
                            type: 'fake',
                            animationName: name || 'none',
                            stopPropagation: function () {
                            }
                        };
                    }
                    function pagesTransition(options) {
                        var container, pageIn, pageOut, animationName, pageInClassName, pageOutClassName, transitionTypeName, beforeTransition, onTransitionStart, onTransitionEnd, timer, timeOut = 3500;
                        options = options || {};
                        container = getElement(options.container) || document.body;
                        pageIn = getElement(options.pageIn);
                        pageOut = getElement(options.pageOut);
                        animationName = options.animation || 'none';
                        beforeTransition = options.beforeTransition || function () {
                        };
                        onTransitionStart = options.onTransitionStart || function () {
                        };
                        onTransitionEnd = options.onTransitionEnd || function () {
                        };
                        pageInClassName = animationName + '-transition-view-to-show';
                        pageOutClassName = animationName + '-transition-view-to-hide';
                        transitionTypeName = 'transition-' + animationName;
                        if (pageIn === pageOut) {
                            return;
                        }
                        if (pageIn && pageIn.busy || pageOut && pageOut.busy) {
                            window.console.log('You try apply new animation cannot be applied to the same element until previous animation is not finished.');
                        }
                        if (beforeTransition && beforeTransition(pageIn, pageOut, container) === false) {
                            return;
                        }
                        function onAnimationStart(e) {
                            if (e.animationName !== animationName) {
                                return;
                            }
                            onTransitionStart(pageIn, pageOut, container, e);
                            removePrefixedEvent(container, 'AnimationStart', onAnimationStart);
                        }
                        addPrefixedEvent(container, 'AnimationStart', onAnimationStart);
                        function onAnimationEnd(e) {
                            if (e.animationName !== animationName) {
                                return;
                            }
                            e.stopPropagation();
                            if (pageIn) {
                                pageIn.busy = false;
                            }
                            if (pageOut) {
                                pageOut.busy = false;
                                try {
                                    container.removeChild(pageOut);
                                } catch (e) {
                                    window.console.log(e);
                                }
                                removeClass(pageOut, pageOutClassName);
                            }
                            onTransitionEnd(pageIn, pageOut, container, e);
                            removeClass(container, transitionTypeName);
                            removeClass(pageIn, pageInClassName);
                            if (timer) {
                                clearTimeout(timer);
                            }
                            hideOverlay();
                            removePrefixedEvent(container, 'AnimationEnd', onAnimationEnd);
                        }
                        addPrefixedEvent(container, 'AnimationEnd', onAnimationEnd);
                        if (animationName === 'none') {
                            if (pageIn) {
                                container.appendChild(pageIn);
                            }
                            onTransitionStart(pageIn, pageOut, container, getFakeEventObj());
                            if (pageOut) {
                                try {
                                    container.removeChild(pageOut);
                                } catch (err) {
                                    window.console.log('You try apply new animation without subject');
                                }
                                onTransitionEnd(pageIn, pageOut, container, getFakeEventObj());
                            } else {
                                onTransitionEnd(pageIn, pageOut, container, getFakeEventObj());
                            }
                            return;
                        }
                        if (pageIn) {
                            pageIn.busy = true;
                            addClass(pageIn, pageInClassName);
                            container.appendChild(pageIn);
                        }
                        if (pageOut) {
                            pageOut.busy = true;
                            addClass(pageOut, pageOutClassName);
                            pageOut.offsetHeight;
                        }
                        showOverlay();
                        timer = window.setTimeout(function () {
                            onAnimationEnd(getFakeEventObj(animationName));
                        }, timeOut);
                        addClass(container, transitionTypeName);
                    }
                    return pagesTransition;
                }();
            if (typeof exports !== 'undefined') {
                exports.module = animateTransition;
            }
        },
        function (module, exports) {
            function BackStack(core, id) {
                var self = {}, router, stubStack = [], toForward = false, START_URL = 'index.html', ID_SEPARATOR = '%%%', routerType = function (type) {
                        var newAPI = typeof history.pushState === 'function', result = newAPI ? 'native' : 'hashbang', types = [
                                'native',
                                'hashbang',
                                'custom'
                            ];
                        if (type && types.indexOf(type) > 0) {
                            result = type;
                        }
                        return result;
                    }(core.options.backstackType);
                function getRootView(el) {
                    var result, nodes, i, l, id;
                    nodes = el.childNodes;
                    for (i = 0, l = nodes.length; i < l; i += 1) {
                        if (nodes[i].getAttribute) {
                            result = nodes[i].getAttribute('view');
                            id = nodes[i].getAttribute('id');
                            id = id ? '#' + id : '.' + nodes[i].className.split(' ').join('.');
                            if (result) {
                                return {
                                    content: result,
                                    container_id: id
                                };
                            }
                        }
                    }
                    for (i = 0, l = nodes.length; i < l; i += 1) {
                        result = getRootView(nodes[i]);
                        if (result) {
                            return result;
                        }
                    }
                }
                function buildURL(view) {
                    var children, index, length, childID, child, tmp, result = [];
                    function comparator(a, b) {
                        var val1 = a.container_id, val2 = b.container_id, result = 0;
                        if (val1 > val2) {
                            result = 1;
                        } else if (val1 < val2) {
                            result = -1;
                        }
                        return result;
                    }
                    if (!view) {
                        return result;
                    }
                    children = view.getChildren();
                    for (index = 0, length = children.length; index < length; index += 1) {
                        child = _.clone(children[index]);
                        result.push(child);
                        childID = child.content;
                        tmp = buildURL(core.getView(childID));
                        if (tmp && tmp.length > 0) {
                            child.children = tmp;
                        }
                    }
                    result.sort(comparator);
                    return result;
                }
                function packURL(urlObj, timestamp, animation) {
                    return encodeURIComponent(JSON.stringify(urlObj)).replace(/[!'()]/g, escape).replace(/\*/g, '%2A') + '$$$' + timestamp + '$$$' + animation;
                }
                function unpackURL(packURLString) {
                    var result = {}, tmpArr;
                    tmpArr = packURLString.split('$$$');
                    result.urlObj = JSON.parse(decodeURIComponent((tmpArr[0] + '').replace(/\+/g, '%20')));
                    result.timestamp = tmpArr[1];
                    result.animation = tmpArr[2];
                    return result;
                }
                function HistoryStack() {
                    var self = this, lastValue, currentPosition = -1, stack = [];
                    self.push = function (data) {
                        var position;
                        if (currentPosition !== stack.length - 1) {
                            position = currentPosition + 1;
                            stack = stack.slice(0, position);
                        }
                        if (lastValue !== undefined && lastValue !== null) {
                            stack.push(lastValue);
                        }
                        lastValue = data;
                        currentPosition = stack.length - 1;
                    };
                    self.getCurrent = function () {
                        if (lastValue !== undefined && lastValue !== null) {
                            return lastValue;
                        }
                        return stack[currentPosition];
                    };
                    self.getNext = function () {
                        var position, result;
                        position = currentPosition + 1;
                        if (position > -1 && position < stack.length) {
                            result = stack[position];
                            currentPosition = position;
                        }
                        return result;
                    };
                    self.getPrevious = function () {
                        var position, result;
                        if (lastValue) {
                            stack.push(lastValue);
                            currentPosition = stack.length - 1;
                            lastValue = null;
                        }
                        position = currentPosition - 1;
                        if (position > -1 && position < stack.length) {
                            result = stack[position];
                            currentPosition = position;
                        }
                        return result;
                    };
                    self.clear = function () {
                        lastValue = null;
                        stack = [];
                        currentPosition = stack.length - 1;
                    };
                    return self;
                }
                router = {
                    currentID: Math.floor(Math.random() * 100000),
                    currentURL: undefined,
                    lastURL: undefined,
                    toBack: true,
                    isBlocked: false,
                    stack: new HistoryStack(),
                    pushToStackRequest: false,
                    navigate: function (newUrl) {
                        var self = this;
                        switch (routerType) {
                        case 'native':
                            history.pushState({
                                url: newUrl,
                                id: self.currentID
                            }, null, null);
                            break;
                        case 'hashbang':
                            toForward = true;
                            window.location.href = START_URL + '#!' + newUrl + ID_SEPARATOR + self.currentID;
                            break;
                        case 'custom':
                            if (stubStack.last) {
                                stubStack.push(stubStack.last);
                            }
                            stubStack.last = {
                                state: {
                                    url: newUrl,
                                    id: self.currentID
                                }
                            };
                            break;
                        }
                        self.lastURL = newUrl;
                        self.currentURL = newUrl;
                        self.pushToStackRequest = false;
                        self.stack.push(newUrl);
                    },
                    saveScoopeAsURL: function (datawrapper) {
                        var timestamp = +new Date().getTime(), rootModule = getRootView(document.body), rootView = core.getView(rootModule.content), animation = datawrapper.animation ? datawrapper.animation : core.options.defaultAnimation, children = buildURL(rootView);
                        if (children && children.length > 0) {
                            rootModule.children = children;
                        }
                        this.navigate(packURL(rootModule, timestamp, animation));
                    },
                    onNewTransition: function () {
                        this.toBack = true;
                        this.isBlocked = false;
                        this.pushToStackRequest = true;
                    },
                    back: function () {
                        this.toBack = true;
                        switch (routerType) {
                        case 'native':
                        case 'hashbang':
                            history.back();
                            break;
                        case 'custom':
                            var state = stubStack.pop();
                            if (state) {
                                router.onPopState(state);
                            }
                            break;
                        }
                    },
                    clearAndBlock: function () {
                        this.toBack = true;
                        this.isBlocked = true;
                        this.currentURL = undefined;
                        this.lastURL = undefined;
                        this.currentID = Math.floor(Math.random() * 100000);
                        this.stack.clear();
                        stubStack = [];
                        stubStack.last = null;
                    },
                    extractDiffer: function (oldLayout, newLayout) {
                        var i, l, result, attr;
                        for (attr in oldLayout) {
                            if (oldLayout.hasOwnProperty(attr) && attr !== 'children') {
                                if (oldLayout[attr] !== newLayout[attr]) {
                                    delete newLayout.children;
                                    return newLayout;
                                }
                            }
                        }
                        if (oldLayout.hasOwnProperty('children')) {
                            for (i = 0, l = oldLayout.children.length; i < l; i += 1) {
                                result = this.extractDiffer(oldLayout.children[i], newLayout.children[i]);
                                if (result) {
                                    return result;
                                }
                            }
                        }
                        return result;
                    },
                    onPopState: function (event) {
                        var param, differ, directionStr, changeDirection = false, flagToBackDirection = this.toBack;
                        if (event.state && event.state.id === this.currentID && this.currentURL && !this.isBlocked) {
                            if (this.lastURL && this.lastURL === event.state.url) {
                                changeDirection = true;
                                flagToBackDirection = !flagToBackDirection;
                            }
                            if (flagToBackDirection) {
                                param = this.stack.getPrevious();
                            } else {
                                param = this.stack.getNext();
                            }
                            directionStr = this.toBack ? 'back' : 'forward';
                            if (param) {
                                if (changeDirection) {
                                    this.toBack = !this.toBack;
                                }
                                differ = this.extractDiffer(unpackURL(this.currentURL).urlObj, unpackURL(param).urlObj);
                                differ.direction = this.toBack;
                                differ.animation = this.toBack ? unpackURL(this.currentURL).animation : unpackURL(param).animation;
                                differ.animation = differ.animation.replace(/-in$|-out$/, function (sufix) {
                                    if (sufix === '-in') {
                                        return '-out';
                                    } else {
                                        return '-in';
                                    }
                                });
                                core.publish('navigation.back', differ);
                                this.lastURL = this.currentURL;
                                this.currentURL = param;
                                differ.direction = directionStr;
                                core.publish('backstack.pop', differ);
                            } else {
                                core.publish('backstack.empty', { direction: directionStr });
                            }
                        }
                    }
                };
                function onMessage(channel, data) {
                    var parts = channel.split('.');
                    switch (parts[1]) {
                    case 'beginTransition':
                        router.onNewTransition();
                        break;
                    case 'endTransition':
                        if (router.pushToStackRequest) {
                            router.saveScoopeAsURL(data);
                        }
                        break;
                    case 'back':
                        router.back();
                        break;
                    case 'clear':
                        router.clearAndBlock();
                        break;
                    }
                }
                core.subscribe('router', onMessage, self);
                switch (routerType) {
                case 'native':
                    core.window.onpopstate = function (event) {
                        router.onPopState(event);
                    };
                    break;
                case 'hashbang':
                    $(window).bind('hashchange', function () {
                        var tmp = window.location.href.substring(window.location.href.lastIndexOf('#!') + 2), strings = tmp.split(ID_SEPARATOR), href = strings[0], id = parseInt(strings[1], 10);
                        if (!toForward) {
                            router.onPopState({
                                state: {
                                    id: id,
                                    url: href
                                }
                            });
                        }
                        toForward = false;
                    });
                    break;
                case 'custom':
                    break;
                }
                self.destroy = function () {
                    core.unsubscribe(self);
                };
                return self;
            }
            if (typeof exports !== 'undefined') {
                exports.module = BackStack;
            }
        },
        function (module, exports) {
            function GestureTracker(element) {
                var attr;
                this._el = element;
                for (attr in this.TRACK_EVENTS) {
                    if (this.TRACK_EVENTS.hasOwnProperty(attr)) {
                        this._el.addEventListener(this.TRACK_EVENTS[attr], this, false);
                    }
                }
                this.destroy = function () {
                    for (attr in this.TRACK_EVENTS) {
                        if (this.TRACK_EVENTS.hasOwnProperty(attr)) {
                            this._el.removeEventListener(this.TRACK_EVENTS[attr], this);
                        }
                    }
                    this._el = null;
                };
            }
            GestureTracker.prototype = {
                HOLD_TIMEOUT: 350,
                TRACK_EVENTS: {
                    up: 'pointerup',
                    down: 'pointerdown',
                    move: 'pointermove',
                    over: 'pointerover',
                    chancel: 'pointercancel'
                },
                tracks: {},
                handleEvent: function (e) {
                    switch (e.type) {
                    case this.TRACK_EVENTS.down:
                        this._pointerDown(e);
                        break;
                    case this.TRACK_EVENTS.move:
                        this._pointerMove(e);
                        break;
                    case this.TRACK_EVENTS.chancel:
                    case this.TRACK_EVENTS.up:
                        this._pointerUp(e);
                        break;
                    }
                },
                _pointerDown: function (e) {
                    var gesture = this;
                    clearTimeout(this._holdID);
                    this._holdID = setTimeout(function () {
                        gesture._fireEvent('hold', e);
                    }, this.HOLD_TIMEOUT);
                    this.tracks[e.pointerId] = {
                        start: {
                            clientX: e.clientX,
                            clientY: e.clientY,
                            timeStamp: e.timeStamp
                        },
                        pre: {
                            clientX: e.clientX,
                            clientY: e.clientY,
                            timeStamp: e.timeStamp
                        },
                        last: {
                            clientX: e.clientX,
                            clientY: e.clientY,
                            timeStamp: e.timeStamp
                        },
                        end: {
                            clientX: e.clientX,
                            clientY: e.clientY,
                            timeStamp: e.timeStamp
                        }
                    };
                },
                _pointerMove: function (e) {
                    if (e.timeStamp - this.tracks[e.pointerId].last.timeStamp > 10) {
                        clearTimeout(this._holdID);
                        this.tracks[e.pointerId].pre.clientX = this.tracks[e.pointerId].last.clientX;
                        this.tracks[e.pointerId].pre.clientY = this.tracks[e.pointerId].last.clientY;
                        this.tracks[e.pointerId].pre.timeStamp = this.tracks[e.pointerId].last.timeStamp;
                        this.tracks[e.pointerId].last.clientX = e.clientX;
                        this.tracks[e.pointerId].last.clientY = e.clientY;
                        this.tracks[e.pointerId].last.timeStamp = e.timeStamp;
                    }
                },
                _pointerUp: function (e) {
                    clearTimeout(this._holdID);
                    this.tracks[e.pointerId].end.clientX = e.clientX;
                    this.tracks[e.pointerId].end.clientY = e.clientY;
                    this.tracks[e.pointerId].end.timeStamp = e.timeStamp;
                    this._checkGesture(e);
                    this.tracks[e.pointerId] = null;
                },
                _checkGesture: function (e) {
                    var isMoved, isFling, pointerId = e.pointerId, pointer = this.tracks[pointerId];
                    function distance(x1, x2, y1, y2) {
                        return Math.pow((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1), 0.5);
                    }
                    isMoved = Math.abs(distance(pointer.start.clientX, pointer.end.clientX, pointer.start.clientY, pointer.end.clientY)) > 20;
                    isFling = Math.abs(distance(pointer.end.clientX, pointer.pre.clientX, pointer.end.clientY, pointer.pre.clientY)) > 0 && pointer.end.timeStamp - pointer.start.timeStamp > 300;
                    if (isFling) {
                        this._fireEvent('fling', e, {
                            start: pointer.start,
                            end: pointer.end,
                            speedX: (pointer.end.clientX - pointer.pre.clientX) / (pointer.end.timeStamp - pointer.pre.timeStamp),
                            speedY: (pointer.end.clientY - pointer.pre.clientY) / (pointer.end.timeStamp - pointer.pre.timeStamp)
                        });
                    } else if (!isMoved) {
                        if (pointer.end.timeStamp - pointer.start.timeStamp > 300) {
                            this._fireEvent('longtap', e);
                        } else {
                            this._fireEvent('tap', e);
                        }
                    }
                },
                _fireEvent: function (type, e, addiction) {
                    var attr, customEvent = document.createEvent('MouseEvents');
                    customEvent.initMouseEvent(type, true, true, window, 1, e.screenX, e.screenY, e.clientX, e.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, e.relatedTarget);
                    customEvent.pointerId = this.touchID;
                    customEvent.pointerType = e.pointerType;
                    if (addiction) {
                        for (attr in addiction) {
                            if (addiction.hasOwnProperty(attr)) {
                                customEvent[attr] = addiction[attr];
                            }
                        }
                    }
                    e.target.dispatchEvent(customEvent);
                }
            };
            if (typeof exports !== 'undefined') {
                exports.module = GestureTracker;
            }
        },
        function (module, exports) {
            var STRINGS = {
                    touchstart: 'touchstart',
                    touchmove: 'touchmove',
                    touchend: 'touchend',
                    touchleave: 'touchleave',
                    touchcancel: '.touchcancel',
                    mousedown: 'mousedown',
                    mousemove: 'mousemove',
                    mouseup: 'mouseup',
                    mouseover: 'mouseover',
                    mouseout: 'mouseout'
                };
            function PointerTracker(element) {
                this._el = element;
                this.isDown = false;
                this.chancelId = false;
                if (!this.isTouched) {
                    this._el.addEventListener(STRINGS.mousedown, this, false);
                    this._el.addEventListener(STRINGS.mouseup, this, false);
                    this._el.addEventListener(STRINGS.mousemove, this, false);
                    this._el.addEventListener(STRINGS.mouseout, this, false);
                    this._el.addEventListener(STRINGS.mouseover, this, false);
                } else {
                    this._el.addEventListener(STRINGS.touchstart, this, false);
                    this._el.addEventListener(STRINGS.touchend, this, false);
                    this._el.addEventListener(STRINGS.touchmove, this, false);
                    this._el.addEventListener(STRINGS.touchcancel, this, false);
                }
                this.destroy = function () {
                    if (!this.isTouched) {
                        this._el.removeEventListener(STRINGS.mousedown, this);
                        this._el.removeEventListener(STRINGS.mouseup, this);
                        this._el.removeEventListener(STRINGS.mousemove, this);
                        this._el.removeEventListener(STRINGS.mouseout, this);
                        this._el.removeEventListener(STRINGS.mouseover, this);
                    } else {
                        this._el.removeEventListener(STRINGS.touchstart, this);
                        this._el.removeEventListener(STRINGS.touchend, this);
                        this._el.removeEventListener(STRINGS.touchmove, this);
                        this._el.removeEventListener(STRINGS.touchcancel, this);
                    }
                    delete this._el;
                };
            }
            PointerTracker.prototype = {
                EVENTS: {
                    up: 'pointerup',
                    down: 'pointerdown',
                    move: 'pointermove',
                    over: 'pointerover',
                    chancel: 'pointercancel'
                },
                isTouched: 'ontouchstart' in window,
                handleEvent: function (e) {
                    if (this.chancelId !== null) {
                        clearTimeout(this.chancelId);
                    }
                    switch (e.type) {
                    case STRINGS.touchmove:
                    case STRINGS.mousemove:
                        if (this.isDown) {
                            this._fireEvent(this.EVENTS.move, e);
                        }
                        break;
                    case STRINGS.touchstart:
                    case STRINGS.mousedown:
                        this.isDown = true;
                        this.chancelId = false;
                        this._fireEvent(this.EVENTS.down, e);
                        break;
                    case STRINGS.touchend:
                    case STRINGS.touchleave:
                    case STRINGS.touchcancel:
                    case STRINGS.mouseup:
                        if (this.isDown) {
                            this.isDown = !this._fireEvent(this.EVENTS.up, e);
                        }
                        break;
                    case STRINGS.mouseover:
                        if (this.isDown) {
                            this._fireEvent(this.EVENTS.over, e);
                        }
                        break;
                    case STRINGS.mouseout:
                        var pointerTracker = this;
                        if (this.isDown) {
                            this.chancelId = setTimeout(function () {
                                pointerTracker.isDown = false;
                                pointerTracker._fireEvent(pointerTracker.EVENTS.chancel, e);
                                pointerTracker.chancelId = null;
                            }, 10);
                        }
                        break;
                    }
                },
                _fireEvent: function (type, e) {
                    var touchEvent = e, i, l, customEvent;
                    if (this.isTouched) {
                        if (e.type === STRINGS.touchstart) {
                            if (e.touches.length > 1) {
                                return false;
                            }
                            touchEvent = e.touches[0];
                            this.touchID = e.touches[0].identifier;
                        } else {
                            for (i = 0, l = e.changedTouches.length; i < l; i++) {
                                touchEvent = e.changedTouches[i];
                                if (touchEvent.identifier === this.touchID) {
                                    break;
                                }
                            }
                            if (touchEvent.identifier !== this.touchID) {
                                return false;
                            }
                        }
                    } else {
                        this.touchID = 1;
                    }
                    customEvent = document.createEvent('MouseEvents');
                    customEvent.initMouseEvent(type, true, true, window, 1, touchEvent.screenX, touchEvent.screenY, touchEvent.clientX, touchEvent.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, e.relatedTarget);
                    customEvent.preventDefault = function () {
                        if (e.preventDefault !== undefined)
                            e.preventDefault();
                    };
                    if (customEvent.stopPropagation !== undefined) {
                        var current = customEvent.stopPropagation;
                        customEvent.stopPropagation = function () {
                            if (e.stopPropagation !== undefined)
                                e.stopPropagation();
                            current.call(this);
                        };
                    }
                    customEvent.pointerId = this.touchID;
                    customEvent.pointerType = this.isTouched ? 'touch' : 'mouse';
                    var isFirefox = typeof window.InstallTrigger !== 'undefined';
                    if (isFirefox) {
                        customEvent.__defineGetter__('timeStamp', function () {
                            return e.timeStamp;
                        });
                    }
                    e.target.dispatchEvent(customEvent);
                    return true;
                }
            };
            if (typeof exports !== 'undefined') {
                exports.module = PointerTracker;
            }
        }
    ];
    return _require(1);
}());