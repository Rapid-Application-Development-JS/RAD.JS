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
var register = Core.register;
var unregister = Core.unregister;

function isRendering() {
    return !!currentElement();
}

function makeId(options) {
    if (options && options.key) {
        return 'key-' + options.key;
    }
    return _.result(options, 'id', _.uniqueId('view-'));
}

function resolveTemplate(template) {
    if (typeof template === 'string') {
        return RAD.template(template);
    }

    return template;
}

var BaseView = function(options) {
    _.extend(this, _.pick(options, Config.ViewOptions));

    var Props = this.propsModel || Backbone.Model;

    this.props = new Props( _.omit(options, Config.ViewOptions) );
    this.cid = makeId(options);
    this.refs = {};

    this._bindChannels();
    this._ensureElement();
    this.initialize.apply(this, arguments);
    this._syncElement();

    this.template = resolveTemplate(this.template);

    this.bindRender(this.props, 'change');
    this.initialize.redy = true;

    register(this.getID(), this);
};

BaseView.prototype = _.create(Backbone.View.prototype, {
    _bindChannels: function() {
        var id = this.getID();
        var attachMsg = id + ':' + Events.ATTACH;
        var detachMsg = id + ':' + Events.DETACH;

        this.subscribe(id, this.onReceiveMsg, this);
        this.subscribe(attachMsg, this.onAttach, this);
        this.subscribe(detachMsg, this.onDetach, this);

        if (isRendering()) {
            this.subscribe(detachMsg, this.destroy, this);
        }
    },

    getID: function() {
        return this.cid;
    },

    setElement: function(el) {
        Backbone.View.prototype.setElement.apply(this, arguments);
        if (this.initialize.redy && !isRendering()) {
            this._syncElement();
        }
        return this;
    },

    _syncElement: function() {
        this.el.setAttribute('key', this.getID());
        patchOuter(this.el, this._renderOuter.bind(this));
        this.el.removeAttribute('key');
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

        if (isRendering()) {
            return this._render();
        }

        patchOuter(this.el, function() {
            self._render();
        });

        return this;
    },

    _render: function () {
        if (this.onBeforeRender() === false) {
            return this._renderOuter();
        }

        this._viewElOpen();
        this._renderTemplate();
        this._viewElClose();

        this.onRender();
        return this;
    },

    _renderTemplate: function() {
        if (typeof this.template === 'function') {
            this.refs = this.template(this.getTemplateData());
        } else {
            skip();
        }
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
        if (this.el !== el || !this.initialize.redy) {
            this.setElement(el);
            this.onElementSet(el);
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
        unregister(this.getID());

        this.remove();
        this.onDestroy();

        this.off();
        this.stopListening();
        this.undelegateEvents();
    }
});

_.extend(BaseView.prototype, Dispatcher, {
    onElementSet:   function() {},
    onReceiveMsg:   function () {},
    onBeforeRender: function () {},
    onRender:       function () {},
    onAttach:       function () {},
    onDetach:       function () {},
    onDestroy:      function () {}
});

BaseView.extend = function(protoProps, staticProps) {
    return Backbone.View.extend.apply(this, arguments)
};

module.exports = BaseView;
