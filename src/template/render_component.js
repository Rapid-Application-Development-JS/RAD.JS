"use strict";

var _ = require("underscore");
var core = require('../core');
var Config = require('../config');
var BaseView = require('../blanks/view');

function render(component, props, content) {
    props = props || {};
    props.key = props.key || props.id;

    // TODO move key prefix to config file
    var registrationId = 'view-key-' + props.key;
    var registeredComponent = core.get( registrationId );

    if (registeredComponent) {
        registeredComponent.props.set(_.omit(props, Config.ViewOptions), {silent:true});
        return registeredComponent.render();
    }

    var newComponent = _.isFunction(component) ? new component(props, content) : component;

    if (newComponent instanceof BaseView) {
        return newComponent.render();
    }

    return newComponent;
}

module.exports = render;