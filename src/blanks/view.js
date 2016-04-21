"use strict";

var _ = require('underscore');
var Backbone = require('backbone');

var IncrementalDOM = require('../template/idom');
var patchOuter = IncrementalDOM.patchOuter;
var elementOpenStart = IncrementalDOM.elementOpenStart;
var elementOpenEnd = IncrementalDOM.elementOpenEnd;
var elementClose = IncrementalDOM.elementClose;
var currentElement = IncrementalDOM.currentElement;
var setAttribute = IncrementalDOM.attr;
var skip = IncrementalDOM.skip;


var Dispatcher = require('../core/dispatcher');
var Config = require('../config');
var Events = Config.Events;
var Core = require('../core');


function initSubscription(view, createdViaPatch) {
    var id = view.getID();
    var attachMsg = id + ':' + Events.ATTACH;
    var detachMsg = id + ':' + Events.DETACH;

    Dispatcher.subscribe(id, view.onReceiveMsg, view);
    Dispatcher.subscribe(attachMsg, view.onAttach, view);
    Dispatcher.subscribe(detachMsg, view.onDetach, view);

    if (createdViaPatch) {
        Dispatcher.subscribe(detachMsg, view.destroy, view);
    }
}

var ViewMixin = {
    // Model class to be used to store props.
    // Override this property with constructor ot specify custom model
    propsModel: Backbone.Model,

    constructor: function(options) {
        options = options || {};

        if (options.key) {
            this.vid = 'key-' + options.key;
        } else {
            this.vid = _.result(options, 'id', _.uniqueId('view-'));
        }

        initSubscription(this, currentElement());

        // Setup props model
        this.props = new this.propsModel( _.omit(options, Config.ViewOptions) );

        // Call Backbone constructor and initialize callback
        Backbone.View.apply(this, arguments);

        this.resolveTemplate();
        this.bindRender(this.props, 'change');
        Core.register(this.getID(), this);
    },

    getID: function() {
        return this.vid;
    },

    setElement: function() {
        Backbone.View.prototype.setElement.apply(this, arguments);

        this.el.setAttribute('key', this.getID());
        patchOuter(this.el, this._renderOuter.bind(this));
        this.el.removeAttribute('key');
    },

    resolveTemplate: function() {
        if (_.isString(this.template)) {
            this.template = RAD.template(this.template);
        }
    },

    getTemplateData: function() {
        return {
            collection: this.collection && this.collection.toJSON(),
            model: this.model && this.model.toJSON(),
            props: this.props.toJSON()
        };
    },

    bindRender: function(target, events) {
        this.listenTo(target, events, this.render);
    },

    render: function () {
        var self = this;

        if (currentElement()) {

            return this._render();
        }

        patchOuter(this.el, function() {
            self._render();
        });

        return this;
    },

    _render: function () {
        // Skip content changes if render is not allowed
        if (this.onBeforeRender() === false) {
            return this._renderOuter();
        }

        this._viewElOpen();
        if (typeof this.template === 'function') {
            this.refs = this.template(this.getTemplateData());
        } else {
            skip();
        }
        this._viewElClose();
        this.onRender();
        return this;
    },

    _renderOuter: function() {
        this._viewElOpen();
        skip();
        this._viewElClose();
        return this;
    },

    _viewElOpen: function () {
        elementOpenStart(this.el.tagName.toLowerCase(), this.getID());
        this._setElAttrs();
        elementOpenEnd();
    },
    _viewElClose: function () {
        var el = elementClose(this.el.tagName.toLowerCase());
        if (this.el !== el) {
            this.setElement();
        }
    },
    _setElAttrs: function() {
        var attributes = _.result(this, 'attributes', {});
        attributes.id = _.result(this, 'id');
        attributes.class = _.result(this, 'className');
        attributes[Config.Attributes.ID] = this.getID();

        _.each(attributes, function (value, name) {
            setAttribute(name, value);
        });
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
        Core.unregister(this.getID());

        this.remove();
        this.onDestroy();

        this.off();
        this.stopListening();
        this.undelegateEvents();
    }
};


_.extend(ViewMixin, Dispatcher, {
    onReceiveMsg:   function () {},
    onBeforeRender: function () {},
    onRender:       function () {},
    onAttach:       function () {},
    onDetach:       function () {},
    onDestroy:      function () {}
});

module.exports = Backbone.View.extend(ViewMixin);
