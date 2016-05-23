"use strict";
var _ = require('underscore');
var Backbone = require('backbone');
var Dispatcher = require('../core/dispatcher');

var moduleOptions = ['channel', 'id'];

function Module(options) {
    this.cid = _.uniqueId('module');

    _.extend(this, _.pick(options, moduleOptions));

    this.id = _.result(this, 'id', this.cid);
    this.initialize.apply(this, arguments);

    if (this.channel) {
        this.subscribe(this.channel, this.onReceiveMsg, this);
    }
}

_.extend( Module.prototype, Dispatcher, {
    initialize: function () {},
    onReceiveMsg: function () {},

    destroy: function () {
        this.unsubscribe(null,null, this);
    }
});

Module.extend = Backbone.View.extend;

module.exports = Module;