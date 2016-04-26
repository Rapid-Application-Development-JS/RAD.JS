"use strict";

var _ = require('underscore');
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

function setAsProperty(el, prop, value) {
    el[prop] = value;
}

attributeSetters.innerHTML = setAsProperty;

function patchWrapper(patch, node, renderFn, data) {
    publish(Events.PATCH_START, node);
    patch.call(null, node, renderFn, data);
    publish(Events.PATCH_END, node);
}

incrementalDOM.patch = incrementalDOM.patchInner = _.wrap(incrementalDOM.patchInner, patchWrapper);
incrementalDOM.patchOuter = _.wrap(incrementalDOM.patchOuter, patchWrapper);

module.exports = incrementalDOM;