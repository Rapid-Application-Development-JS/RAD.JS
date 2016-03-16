"use strict";

var _ = require('underscore');
var Backbone = require('backbone');
var Dispatcher = _.clone(Backbone.Events);


module.exports = {
    publish: function() {
        Dispatcher.trigger.apply(Dispatcher, arguments);
    },
    subscribe: function(channel, callback, context) {
        Dispatcher.on(channel, callback, context);
    },
    unsubscribe: function(channel, callback, context) {
        Dispatcher.off(channel, callback, context);
    }
};