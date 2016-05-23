"use strict";
var _ = require('underscore');
var Dispatcher = require('./dispatcher');
var InternalEvents = require('../config').Events;

var modules = {};

var defaults = {
    debug: false,
    parameterName: 'data',
    viewAttributes: {
        'data-role': 'view'
    }
};

function Core(Dispatcher) {
    this.options = defaults;

    Dispatcher.subscribe(InternalEvents.REGISTER, this.register, this);
    Dispatcher.subscribe(InternalEvents.UNREGISTER, this.unregister, this);
}


/**
 *  Override RAD.js default settings
 *
 *  @param {Object} options
 *  @param {string} [options.parameterName = model] - Sets the name of the argument to be passed to the template function.
 *  @param {boolean} [options.debug = false]        - Enable console logging
 */
Core.prototype.setOptions = function(options) {
    _.extend(this.options, options);
};

Core.prototype.get = function (id) {
    return modules[id];
};

Core.prototype.getAll = function () {
    return _.clone(modules);
};

Core.prototype.register = function (id, obj) {
    if (modules[id]) {
        throw new Error('Such module ID: '+id+' already registered');
    }
    modules[id] = obj;
};

Core.prototype.unregister = function (id) {
    if (modules[id]) {
        delete modules[id];
    }
};


module.exports = new Core( Dispatcher );


