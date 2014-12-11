/**
 * RAD.js
 * v.0.93b development version
 * Mobidev.biz
 * Date: 02/18/14
 */
var ScriptLoader = require('./chunks/script_loader').scriptLoader;
var Core = require('./chunks/core').core;

// Core Utils
// ----------

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

/**
 *
 * registers namespace and places object there OR return existing one
 * @param {string} destination
 * @param {object} [obj]
 *
 * */

function namespace(destination, obj) {
    if (typeof destination !== 'string') {
        window.console.log('Can\'t create namespace, destination or object specified incorrectly:' + destination);
        return;
    }

    // REAL HARDCODE! DON'T DO THIS AT HOME!
//    window.RAD = window.RAD || {};

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

function closest(element, className) {
    var result, el;
    el = element;

    while (!result && el != null) {
        if (el.classList && el.classList.contains(className)) {
            result = el;
        } else if (el.className && el.className.indexOf(className) >= 0){
            result = el; // old browsers support
        }
        el = el.parentNode;
    }

    return result;
}

function preventBodyTouch(e) {
    var tracker = this.scrollTracker;
    if (!tracker.scrollView || (tracker.scrollRequest && ((e.touches[0].screenY > tracker.startIOSTouch && tracker.scrollView.scrollTop === 0) || (tracker.scrollView.scrollTop >= tracker.scrollEnd && e.touches[0].screenY < tracker.startIOSTouch)))) {
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

/**
 *
 * @param {string} modelID
 * @param {function} model - constructor
 * @param {boolean} instantiate - should the constructor be written to namespace or an instance of it (application-level model)
 *
 * */

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

/**
 *
 * @param {function} application - constructor
 * @param {boolean} instantiate - should the constructor be written to namespace or an instance of it
 *
 * */

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

function init(){
    namespace('RAD.view', reg);
    namespace('RAD.service', reg);
    namespace('RAD.plugin', reg);
    namespace('RAD.views', {});
    namespace('RAD.services', {});
    namespace('RAD.plugins', {});
    namespace('RAD.models', {});
    namespace('RAD.utils', {});
    namespace('RAD.scriptLoader', ScriptLoader);
}

exports.core = new Core(window.jQuery, document, window);
exports.model = modelMethod;
exports.application = registerApp;
exports.namespace = namespace;
exports.init = init;