'use strict';

var _ = require('underscore');
var publish = require('../../core/dispatcher').publish;
var iDOM = require('../../template/idom');
var Events = require('../../config').Events;
var utils = require('./utils');
var transition = require('./transition');
var initTransitionOptions = require('./transitionOptions');

var elementOpen = iDOM.elementOpen;
var elementClose = iDOM.elementClose;

var elementOpenStart = iDOM.elementOpenStart;
var elementOpenEnd = iDOM.elementOpenEnd;


function placeholder(node) {
    var key = utils.getNodeData(node).key;
    var tagName = node.tagName.toLowerCase();

    elementOpen.apply(null, [tagName, key, null].concat( utils.getNodeAttrs(node) ));
    iDOM.skip();
    elementClose.call(null, tagName);
}

function alignContent(children, position, key) {
    var length = children.length;
    var node = children[position];

    while (position < length && node && utils.getNodeData(node).key !== key) {
        placeholder(node);
        node = children[++position];
    }

    return position;
}

function renderStart(renderData) {
    var position = renderData.position;
    var children = renderData.children;
    var keyMap = renderData.keyMap;

    var level = 0;
    var childLevel = 1;

    function wrapper(elementCreator, tagName, key) {
        var isChild = (++level) === childLevel;
        var isNewChild = false;

        if (isChild) {
            // Check if opened Element is already present in the list.
            if (keyMap[key]) {
                // If so then align its position with current content and return new position
                position = alignContent(children, position, key);
            } else {
                isNewChild = true;
            }
            position++;
        }

        var node = elementCreator.apply(null, utils.toArray(arguments, 1));

        if (isChild) {
            renderData.keysRendered[key] = node;
        }

        if (isNewChild) {
            children.splice(position - 1, 0, node);
            keyMap[key] = node;
            renderData.keysToShow[key] = node;
        }

        renderData.position = position;

        return node;
    }

    // Listen to element open to detect when new Child Element created
    iDOM.elementOpen = _.wrap(iDOM.elementOpen, wrapper);

    var elementOpenKey;
    iDOM.elementOpenStart = _.wrap(iDOM.elementOpenStart, function(elementOpenStart, tagName, key, staticArray) {
        elementOpenKey = key;
        elementOpenStart(tagName, key, staticArray);
    });
    iDOM.elementOpenEnd = _.wrap(iDOM.elementOpenEnd, function(elementOpenEnd, tagName) {
        wrapper(elementOpenEnd, tagName, elementOpenKey);
    });

    // Listen to element close
    iDOM.elementClose = _.wrap(iDOM.elementClose, function(elementClose, tagName) {
        level--;
        return elementClose.call(null, tagName);
    });
}

function renderEnd(renderData) {
    var rootEl = renderData.rootEl;
    var activeKeys = utils.getNodeData(rootEl).keyMap;
    var transitionOptions = initTransitionOptions(renderData.attrs);

    // Restore IncrementalDOM API
    iDOM.elementOpen = elementOpen;
    iDOM.elementClose = elementClose;
    iDOM.elementOpenStart = elementOpenStart;
    iDOM.elementOpenEnd = elementOpenEnd;

    // Align remaining content
    alignContent(renderData.children, renderData.position);

    // Transition statuses
    var enter = 'enter';
    var leave = 'leave';
    var done = 'done';

    // Apply transition
    _.each(rootEl.children, function(node) {
        var key = utils.getNodeData(node).key;
        var render = utils.getRenderData(node);

        if (renderData.keysToShow[key]) {
            render.status = enter;
            transition.enter(node, transitionOptions, function() {
                render.status = done;
            });

        } else if (!renderData.keysRendered[key]) {
            render.status = leave;
            transition.leave(node, transitionOptions, function() {
                render.status = done;
                delete activeKeys[key];
                publish(Events.NODE_REMOVED, node);
            });

        } else {
            // TODO: check statement render.status === enter
            if (render.status === leave || render.status === enter) {
                render.status = enter;
                transition.enter(node, transitionOptions, function() {
                    render.status = done;
                });
            }
        }
    });
}

module.exports = {
    start: renderStart,
    end: renderEnd
};