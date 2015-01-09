var PubSub = require('./pub_sub').pubSub;
var ServiceLocator = require('./service_locator').serviceLocator;
var execute = require('./utils').execute;

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
    var tracker = this.scrollTracker,
        top = tracker.scrollView ? tracker.scrollView.scrollTop : 0,
        onTopBound = (e.changedTouches[0].screenY > tracker.startIOSTouch) && (top <= 0),
        onBottomBound = (e.changedTouches[0].screenY < tracker.startIOSTouch) && (top >= tracker.scrollEnd);

    if ((!tracker.scrollView || tracker.scrollRequest) && (onTopBound || onBottomBound)) {
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
        tracker.scrollEnd = Math.abs(tracker.scrollView.offsetHeight - tracker.scrollView.firstElementChild.offsetHeight);
    }
    tracker = null;
}

function prepareEnvironment(options) {
    var isIOS = navigator.userAgent.match(/(iPad|iPhone|iPod|iOS)/gi) ? true : false,
        isAndroid = (/android/gi).test(window.navigator.appVersion);

    options = options || {};

    if (options.scrollBounce === undefined) {
        options.scrollBounce = true;
    }

    if (options.templateSettings !== undefined){
        _.templateSettings = options.templateSettings;
    }

    if (isIOS) {
        // Prevent window bounce while scrolling
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
    var self = this,
        app = {},
        serviceLocator = new ServiceLocator(),
        pubsub = new PubSub();

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

    self.register = function(value, obj, instantiate) {
        serviceLocator.register(value, obj, instantiate);
    };

    self.registerAll = function(arrayOfServices) {
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

    self.startService = function(service) {
        var result;

        if(!service) {
            result = serviceLocator.instantiateAll(function(id) {
                return id.split('.')[0] === 'service';
            });
        } else {
            if(Object.prototype.toString.call(service) === '[object Array]') {
                result = [];
                for(var i = 0; i < service.length; i++) {
                    result[i] = serviceLocator.get(service[i]);
                }
            } else {
                result = serviceLocator.get(service);
            }
        }

        return result;
    };

    self.startPlugins = function() {
        return serviceLocator.instantiateAll(function(id){
            var parts = id ? id.split('.') : [];
            return parts[0] === 'plugin';
        });
    };

    self.startAll = function(filter) {
        return serviceLocator.instantiateAll(filter);
    };

    // TODO: review and test this method. Can be a problem with setTimeout and children
    self.stop = function (viewID, callback, context) {
        var view = this.getView(viewID),
            length,
            index;

        if (view) {
            if (view.children) {
                for (index = 0, length = view.children.length; index < length; index += 1) {
                    self.stop(view.children[index].content, null);
                }
            }

            window.setTimeout(function() {
                if (typeof view.destroy === 'function') {
                    view.destroy();
                } else {
                    pubsub.unregister(view, true);
                }

                serviceLocator.removeInstance(viewID);

                execute(callback, null, context);

                if (self.options.debug) {
                    window.console.log("destroy:", viewID);
                }
            }, 0);
        }
    };

    // TODO: check how view's children will be handled in this case
    self.stopAll = function () {
        var views = serviceLocator.unregisterAll(),
            i;

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

    self.getAllInstantiate = function() {
        return serviceLocator.getAllInstantiate();
    };

    self.document = document;
    self.window = window;
    self.$ = $;
    self.channels = pubsub.channels;
    self.subscribe = pubsub.subscribe;
    self.unsubscribe = pubsub.unsubscribe;
    self.publish = pubsub.publish;
    self.getLocator = serviceLocator.getLocator; //TODO: oly for test purpose.

    return self;
}
_.templateSettings = {
    evaluate: /\{\{#([\s\S]+?)\}\}/g,
    interpolate: /\{\{[^#\{]([\s\S]+?)[^\}]\}\}/g,
    escape: /\{\{\{([\s\S]+?)\}\}\}/g
};

exports.core = Core;