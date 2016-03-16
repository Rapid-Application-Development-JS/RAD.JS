"use strict";

var _ = require("underscore");
var core = require('../core');
var Config = require('../config');

function initView(View, options) {
    var viewID = 'key-' + options.key;
    var registeredView = core.get(viewID);

    if (registeredView) {
        registeredView.props.set(_.omit(options, Config.ViewOptions), {silent:true});
        return registeredView;
    }

    if ( _.isFunction(View) ) {
        options.autocreated = true;
        return new View(options);
    }

    View.props.set(_.omit(options, Config.ViewOptions), {silent:true});

    return View;
}

function render(content, props) {
    props = props || {};
    props.key = props.key || props.id;

    return initView(content, props)._render().el;
}

module.exports = render;