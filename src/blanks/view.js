"use strict";

var _ = require('underscore');
var Backbone = require('backbone');

var IDOM = require('../template/idom');
var Dispatcher = require('../core/dispatcher');

var Config = require('../config');
var Events = Config.Events;


function initSubscription(view, autoDestroy) {
    var id = view.getID();

    Dispatcher.publish(Events.REGISTER, id, view);
    Dispatcher.subscribe(id, view.onReceiveMsg, view);

    var attachMsg = id + ':' + Events.ATTACH;
    var detachMsg = id + ':' + Events.DETACH;

    Dispatcher.subscribe(attachMsg, view.onAttach, view);
    Dispatcher.subscribe(detachMsg, view.onDetach, view);

    if (autoDestroy) {
        Dispatcher.subscribe(detachMsg, view.destroy, view);
    }
}

function rootElementOpen(view) {
    IDOM.elementOpenStart(view.tagName, view.getID());

    // Attributes which can be passed as view properties
    IDOM.attr('id', _.result(view, 'id'));
    IDOM.attr('class', _.result(view, 'className'));

    // element attributes
    _.each(_.result(view, 'attributes'), function (value, name) {
        IDOM.attr(name, value);
    });

    // RAD specific attributes
    IDOM.attr(Config.Attributes.ID, view.getID());
    IDOM.attr(Config.Attributes.ROLE, 'view');

    return IDOM.elementOpenEnd();
}

function rootElementClose(view) {
    var el = IDOM.elementClose(view.tagName);
    view.setElement(el);
    return el;
}

var ViewMixin = {
    // Model class to be used to store props. Override this property with constructor ot specify custom model
    propsModel: Backbone.Model,

    constructor: function(options) {
        options = options || {};

        // Create specific View id (vid)
        if (options.key) {
            this.vid = 'key-' + options.key;
        } else {
            this.vid = _.result(options, 'vid', _.uniqueId('view-'));
        }

        // Prevent View from being accidentally patched by triggering `render` method during initialization
        // if it was created as inline component (i.e. as custom template tag).
        this._renderDenied = options.autocreated;

        initSubscription(this, options.autocreated);

        // Setup props model
        this.props = new this.propsModel( _.omit(options, Config.ViewOptions) );

        // Call Backbone constructor and initialize callback
        Backbone.View.apply(this, arguments);

        this.bindRender(this.props, 'change');
        this.resolveTemplate();
    },

    // TODO: maybe this can be omitted. Please test
    _ensureElement: function() {
        this.tagName = _.result(this, 'tagName', 'div');

        if (!this.el) {
            this.setElement(this._createElement(this.tagName));
        } else {
            this.setElement(_.result(this, 'el'));
        }
    },

    // Add `onElementSet` callback to Backbone default `setElement` method
    setElement: function(newEl) {
        var currentEl = this.el;

        if (this.el !== newEl) {
            Backbone.View.prototype.setElement.call(this, newEl);
            this.onElementSet(newEl, currentEl);
        }
        return this;
    },

    getID: function() {
        return this.vid;
    },

    resolveTemplate: function() {
        if (_.isString(this.template)) {
            this.template = RAD.template(this.template);
        }
    },

    getTemplateData: function() {
        return {
            collection: this.collection ? this.collection.toJSON() : [],
            model: this.model ? this.model.toJSON() : {},
            props: this.props.toJSON()
        };
    },

    bindRender: function(target, events) {
        this.listenTo(target, events, this.render);
    },

    render: function () {
        if (!this._renderDenied) {
            var patch = this.el.parentNode ? IDOM.patchElement : IDOM.patch;

            patch(this.el, function(self){
                self._render();
            }, this);
        }

        return this;
    },

    _render: function () {
        this._renderDenied = true;

        // Skip content changes if render is not allowed
        if (this.onBeforeRender() === false) {
            rootElementOpen(this);
            IDOM.skip();
            rootElementClose(this);
            return this;
        }

        // Render root element
        rootElementOpen(this);

        if (typeof this.template === 'function') {
            this.refs = this.template(this.getTemplateData());
        }

        // Close root element and set it as `this.el`
        rootElementClose(this);

        this.onRender();
        this._renderDenied = false;
        return this;
    },

    remove: function () {
        var el = this.el;
        var parent = el.parentNode;

        if (parent) {
            parent.removeChild(el);
            this.publish(Events.NODE_REMOVED, el);
        }

        return el;
    },

    destroy: function () {
        this.unsubscribe(null, null, this);
        this.publish(Events.UNREGISTER, this.getID());

        this.remove();
        this.onDestroy();

        this.off();
        this.stopListening();
        this.undelegateEvents();
    }
};


_.extend(ViewMixin, Dispatcher, {
    onElementSet:   function (newEl, oldEl) {},
    onReceiveMsg:   function () {},
    onBeforeRender: function () {},
    onRender:       function () {},
    onAttach:       function () {},
    onDetach:       function () {},
    onDestroy:      function () {}
});

module.exports = Backbone.View.extend(ViewMixin);
