"use strict";
var _ = require('underscore');
var core = require('../../core');
var Module = require('../../blanks/module');
var iDOM = require('../../template/idom');
var renderView = require('../../template/binder');

var Navigator = Module.extend({

    initialize: function() {
        this.subscribe('navigation:show', this.navigateView, this);
        this.subscribe('navigation:back', this.navigateBack, this);

        // Old API support
        this.subscribe('navigation.show', this.navigateView, this);
        this.subscribe('navigation.back', this.navigateBack, this);
    },

    /**
     * @description
     * Allow to navigate View with transition effects
     *
     * @param {Object} data
     * @param {(String|HTMLElement)}    data.container          - CSS selector or HTMLElement where to attach new View
     * @param {String}                  data.content            - View ID to show
     *
     * @param {String}                  [data.animation]        - animation name which will be applied for transition
     * @param {Object}                  [data.extras]           - extra data that you can pass to the new View
     *
     * @callback doneCallback
     * @param {doneCallback}            [data.callback]         - fires on transition end
     */
    navigateView: function(data) {
        data = data || {};

        var container = this.getEl(data.container);

        if (!container) {
            throw new Error('Cannot find container el: ' + data.container);
        }

        this.patchContainer(container, this.getContent(data.content), data.options);
    },

    navigateBack: function (data) {
        data.direction = 'back';
        this.navigateView(data);
    },

    getEl: function(selector) {
        return _.isString(selector) ? document.querySelector(selector) : selector;
    },

    patchContainer: function(container, view, options) {
        iDOM.patch(container, function() {
            if (view) {
                renderView(view, options);
            }
        });
    },

    getContent: function(content) {
        if (_.isString(content)) {
            return core.get(content);
        }

        return content;
    }
});

module.exports = new Navigator();
