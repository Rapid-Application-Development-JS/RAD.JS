'use strict';

var _ = require('underscore');
var IDOM_DATA = '__incrementalDOMData';
var RENDER_DATA = '__renderData';


function getNodeData(el) {
    return el[IDOM_DATA];
}

function setRenderData(node, options) {
    if (!node[RENDER_DATA]) {
        node[RENDER_DATA] = {};
    }
    return _.extend(node[RENDER_DATA], options);
}

function getRenderData(node) {
    return node[RENDER_DATA] || setRenderData(node, {});
}

// array of [key,value]
function getNodeAttrs(node) {
    return _.flatten(_.map(node.attributes, function (attr) {
        return [attr.name, attr.value];
    }));
}

function toArray(args, startIndex) {
    return Array.prototype.slice.call(args, startIndex || 0);
}

module.exports = {
    getNodeData: getNodeData,
    getNodeAttrs: getNodeAttrs,

    getRenderData: getRenderData,
    setRenderData: setRenderData,

    toArray: toArray
};