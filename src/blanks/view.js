"use strict";

var _ = require('underscore');
var Backbone = require('backbone');

var IncrementalDOM = require('../template/idom');
var Dispatcher = require('../core/dispatcher');
var Config = require('../config');
var Events = Config.Events;
var Core = require('../core');
var defaultAttributes = Core.options.viewAttributes;
var register = Core.register;
var unregister = Core.unregister;

function isRendering() {
    return !!IncrementalDOM.currentElement();
}

function makeId(options) {
    if (options && options.key) {
        return 'view-key-' + options.key;
    }
    return _.result(options, 'id', _.uniqueId('view-'));
}

function compileTemplate(template) {
    return typeof template === 'string' ? RAD.template(template) : template;
}

function hasKey(node) {
    return node.__incrementalDOMData && node.__incrementalDOMData.key;
}

var BaseView = function(options) {
    this.viewId = makeId(options);
    this.refs = {};

    var Props = this.propsModel || Backbone.Model;
    this.props = new Props( _.omit(options, Config.ViewOptions) );

    this._bindChannels();
    Backbone.View.apply(this, arguments);
    this.template = compileTemplate(this.template);
    this.bindRender(this.props, 'change');

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

    setElement: function(el) {
        var $el = el instanceof Backbone.$ ? el : Backbone.$(el);
        var viewId = $el.attr(Config.Attributes.ID);

        if (viewId && viewId !== this.getID()) {
            throw new Error('You cannot setElement which is used by another View.');
        } else {
            Backbone.View.prototype.setElement.call(this, $el);
        }
    },

    getID: function() {
        return this.viewId;
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
        if (isRendering()) {
            this._render();
        } else {
            this._renderOuter();
        }
        return this;
    },

    _renderOuter: function() {
        var self = this;
        IncrementalDOM.patchOuter(this.el, function() {
            if (hasKey(self.el)) {
                self._render();
            } else {
                self.el.setAttribute('key', self.getID());
                self._render();
                self.el.removeAttribute('key');
            }
        });
        return this;
    },

    _render: function () {
        if (this.onBeforeRender() === false) {
            return this._skip();
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
            IncrementalDOM.skip();
        }
    },

    _skip: function() {
        this._viewElOpen();
        IncrementalDOM.skip();
        this._viewElClose();
        return this;
    },
    _viewElOpen: function () {
        IncrementalDOM.elementOpenStart(this.el.tagName.toLowerCase(), this.getID());
        this._setElAttributes();
        IncrementalDOM.elementOpenEnd();
    },
    _viewElClose: function () {
        var el = IncrementalDOM.elementClose(this.el.tagName.toLowerCase());
        if (this.el !== el) {
            this.setElement(el);
        }
    },
    _setElAttributes: function() {
        var attributes = _.extend({}, defaultAttributes, _.result(this, 'attributes', {}));
        attributes.id = _.result(this, 'id');
        attributes.class = _.result(this, 'className');
        attributes[Config.Attributes.ID] = this.getID();

        _.each(attributes, function (value, name) {
            IncrementalDOM.attr(name, value);
        });
    },

    _removeElement: function () {
        this.$el.remove();
        this.publish(Events.NODE_REMOVED, this.el);
        return this;
    },

    destroy: function () {
        this.unsubscribe(null, null, this);
        unregister(this.getID());

        this.remove();
        this.onDestroy();

        this.off();
        this.undelegateEvents();
    },
    subscribe: function(channel, callback, context) {
        return Dispatcher.subscribe(channel, callback, context || this);
    },
    unsubscribe: function(channel, callback, context) {
        return Dispatcher.unsubscribe(channel, callback, context || this);
    },
    publish: function() {
        return Dispatcher.publish.apply(Dispatcher, arguments);
    }
});

_.extend(BaseView.prototype, {
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
