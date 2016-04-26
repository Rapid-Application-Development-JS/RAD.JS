'use strict';

var _ = require('underscore');
var iTemplate = require('idom-template');
var IncrementalDOM = require('./idom');
var renderView = require('./render_view');
var core = require('../core');
var BaseView = require('../blanks/view');

var globalComponents = {};

function componentIsView(component) {
    if (typeof component === 'function') {
        return !!component.extend || component.extend;
    }
    return component instanceof BaseView;
}


function wrapComponents(componentsMap) {
    var components = {};

    _.each(componentsMap, function(component, name) {
        if ( componentIsView(component) ) {
            components[name] = function (attrs, innerRender) {
                renderView(component, attrs, innerRender);
            };
        } else {
            components[name] = function (attrs, innerRender) {
                component(attrs, innerRender);
            };
        }

    });

    return components;
}

/**
 *
 * Compile ejs string into IncrementalDOM annotation. iTemplate used for compiling.
 * @param {string} str - input EJS template string
 * @param {object} [options] - options to be passed
 *
 * */

function template(str, options) {
    options = _.defaults({}, options, core.options);
    iTemplate.options(options);

    var templateFn = iTemplate.compile(str, null, options.components);
    var localComponents = wrapComponents(options.components);
    var components = _.extend({}, globalComponents, localComponents);

    function templateWrap(data) {
        return templateFn.call(this, data, IncrementalDOM, components);
    }

    templateWrap.source = function() {
        return templateFn.toString();
    };

    return templateWrap;
}

template.registerHelper = function (name, fn) {
    globalComponents[name] = fn;
    iTemplate.registerHelper(name, fn);
};

template.compileHelper = function (str, options) {
    iTemplate.options(options);
    return iTemplate.compile(str, IncrementalDOM)
};

module.exports = template;