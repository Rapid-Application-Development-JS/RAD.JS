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
            function prepareEnvironment(options) {
                var isIOS = navigator.userAgent.match(/(iPad|iPhone|iPod|iOS)/gi) ? true : false, isAndroid = /android/gi.test(window.navigator.appVersion);
                options = options || {};
                if (options.scrollBounce === undefined) {
                    options.scrollBounce = true;
                }
                _.templateSettings = options.templateSettings || {
                    evaluate: /\{\{#([\s\S]+?)\}\}/g,
                    interpolate: /\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g,
                    escape: /\{\{\{([\s\S]+?)\}\}\}/g
                };
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
            exports.core = Core;
        },
        function (module, exports) {
            function PubSub() {
                var channels = {}, sticky = {}, debug = false, separator = '.';
                function log() {
                    if (debug) {
                        console.log.apply(null, arguments);
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
                            throw new Error('Can\'t subscribe to channel, incorrect channel name');
                        }
                        if (typeof fn != 'function') {
                            throw new Error('Can\'t subscribe to channel, callback is not a function');
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
                        throw new Error('Can\'t load script, URL is incorrect');
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
                if (typeof destination != 'string') {
                    throw new Error('Can\'t create namespace, destination or object specified incorrectly.');
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