"use strict";

var _ = require("underscore");
var core = require('../core');
var Config = require('../config');

function initComponent(View, options) {
    var viewID = 'key-' + options.key;
    var registeredView = core.get(viewID);

    if (registeredView) {
        registeredView.props.set(_.omit(options, Config.ViewOptions), {silent:true});
        return registeredView;
    }

    if ( _.isFunction(View) ) {
        return new View(options);
    }

    View.props.set(_.omit(options, Config.ViewOptions), {silent:true});

    return View;
}

function render(component, props) {
    props = props || {};
    props.key = props.key || props.id;

    return initComponent(component, props).render();
}

module.exports = render;