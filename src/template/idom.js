"use strict";

var _ = require('underscore');
var Backbone = require('backbone');
var publish = require('../core/dispatcher').publish;
var incrementalDOM = require('incremental-dom');
var attributeSetters = incrementalDOM.attributes;
var UtilsDOM = require('./../utils/DOM_Utils');
var Events = require('../config').Events;

// Sett HTMlInput [checked], [disabled] and [readonly] attributes as properties
function setBooleanAttr(el, attr, value) {
    el[attr] = !!value;
}

attributeSetters.checked  = setBooleanAttr;
attributeSetters.disabled = setBooleanAttr;
attributeSetters.readOnly = setBooleanAttr;

// Class names muttator handle classes added only via template.
// Any classes added via DOM manipulation will stay untouched and must be handled by user
attributeSetters.className = attributeSetters['class'] = function(el, attr, value) {
    value = value || '';

    UtilsDOM.removeClass(el, el.__className);
    UtilsDOM.addClass(el, value);
    el.__className = value;
};

incrementalDOM.events = _.clone(Backbone.Events);

function eventWrapper(event, args) {
    var method = args[0];
    var params = Array.prototype.slice.call(args, 1);
    incrementalDOM.events.trigger.apply(incrementalDOM.events, [event + ':before'].concat(params));
    var result = method.apply(null, params);
    incrementalDOM.events.trigger.apply(incrementalDOM.events, [event + ':after'].concat(params));
    return result;
}

incrementalDOM.elementOpen = _.wrap(incrementalDOM.elementOpen, function() {
    return eventWrapper('elementOpen', arguments);
});
incrementalDOM.elementClose = _.wrap(incrementalDOM.elementClose, function() {
    return eventWrapper('elementClose', arguments);
});
incrementalDOM.elementOpenStart = _.wrap(incrementalDOM.elementOpenStart, function() {
    return eventWrapper('elementOpenStart', arguments);
});
incrementalDOM.elementOpenEnd = _.wrap(incrementalDOM.elementOpenEnd, function() {
    return eventWrapper('elementOpenEnd', arguments);
});
incrementalDOM.elementVoid = function(tag) {
    incrementalDOM.elementOpen.apply(null, arguments);
    return incrementalDOM.elementClose(tag);
};


function patchWrapper(patch, node, renderFn, data) {
    publish(Events.PATCH_START, node);
    patch.call(null, node, renderFn, data);
    publish(Events.PATCH_END, node);
}

incrementalDOM.patch = incrementalDOM.patchInner = _.wrap(incrementalDOM.patchInner, patchWrapper);
incrementalDOM.patchOuter = _.wrap(incrementalDOM.patchOuter, patchWrapper);

module.exports = incrementalDOM;