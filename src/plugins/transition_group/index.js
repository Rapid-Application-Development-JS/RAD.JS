'use strict';

var _ = require('underscore');
var iDOM = require('../../template/idom');
var template = require('../../template');
var utils = require('./utils');
var content = require('./content');

function rootElementOpen(attrs) {
    iDOM.elementOpenStart(attrs.tagName);
    iDOM.attr('class', attrs.class);
    iDOM.elementOpenEnd(attrs.tagName);
}

function rootElementClose(attrs) {
    iDOM.elementClose(attrs.tagName);
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

template.registerHelper('transition', function(attrs, render) {
    rootElementOpen(attrs);

    var renderData = initRenderData(iDOM.currentElement(), attrs);
    content.start(renderData);
    render();
    content.end(renderData);

    rootElementClose(attrs);
});