'use strict';

var _ = require('underscore');
var IncrementalDOM = require('../../template/idom');
var template = require('../../template');
var utils = require('./utils');
var contentHandler = require('./contentHandler');

var reservedAttrs = [
    'name', // deprecated
    'animationName',
    'initialAnimation',
    'tagName',
    'enterTimeout',
    'leaveTimeout',
    'enterClass',
    'leaveClass',
    'activeClass'
];

function rootElementOpen(options) {
    IncrementalDOM.elementOpenStart(options.tagName);

    var attributes = _.omit(options, reservedAttrs);
    _.each(attributes, function (value, name) {
        IncrementalDOM.attr(name, value);
    });

    IncrementalDOM.elementOpenEnd();
}

function rootElementClose(attrs) {
    IncrementalDOM.elementClose(attrs.tagName);
}

function initRenderData(rootEl, attrs) {
    return {
        rootEl: rootEl,
        attrs: attrs,
        children: utils.toArray(rootEl.children),
        keyMap: _.clone(utils.getNodeData(rootEl).keyMap) || {},
        keysRendered: {},
        keysToShow: {},
        position: 0
    };
}

template.registerHelper('transition', function(options, renderContent) {
    if (options.name) {
        console.warn('Warning: `name` is deprecated attribute for transitionGroup, use `animationName` instead');
    }

    rootElementOpen(options);

    var renderData = initRenderData(IncrementalDOM.currentElement(), options);
    contentHandler.start(renderData);
    renderContent();
    contentHandler.stop(renderData);

    rootElementClose(options);

    contentHandler.doTransition(renderData);
});