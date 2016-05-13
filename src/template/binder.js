"use strict";

var _ = require("underscore");
var core = require('../core/index');
var Config = require('../config/index');

function binder(component, props, content) {

    var BaseView = require('./../blanks/view');
    
    props = props || {};
    props.key = props.key || props.id;

    // If BaseView instance was passed
    if (component instanceof BaseView) {
        component.props.set(_.omit(props, Config.ViewOptions), {silent:true});
        return component.render();
    }

    // If component with passed key already registered
    var registrationId = 'view-key-' + props.key;
    var registeredComponent = core.get( registrationId );

    if (registeredComponent) {
        registeredComponent.props.set(_.omit(props, Config.ViewOptions), {silent:true});
        return registeredComponent.render();
    }

    // If new component was passed
    var newComponent = _.isFunction(component) ? new component(props, content) : component;
    if (newComponent instanceof BaseView) {
        return newComponent.render();
    }

    return newComponent;
}

module.exports = binder;