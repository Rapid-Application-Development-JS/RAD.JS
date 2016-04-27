'use strict';

var _ = require('underscore');
var publish = require('../../core/dispatcher').publish;
var iDOM = require('../../template/idom');
var Events = require('../../config').Events;
var utils = require('./utils');
var transition = require('./transition');
var initTransitionOptions = require('./options');

var elementOpen = iDOM.elementOpen;
var elementClose = iDOM.elementClose;
var elementOpenStart = iDOM.elementOpenStart;
var elementOpenEnd = iDOM.elementOpenEnd;

var RenderStatus = {
    ENTER: 'enter',
    LEAVE: 'leave',
    DONE: 'done'
};

// TODO use elementOpenStart/End instead of elementOpen
function createPlaceholder(node) {
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
        createPlaceholder(node);
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

    function elementHandler(createMethod, tagName, key) {
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

        var node = createMethod.apply(null, utils.toArray(arguments, 1));

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

    iDOM.elementOpen = _.wrap(iDOM.elementOpen, elementHandler);

    iDOM.elementClose = _.wrap(iDOM.elementClose, function(elementClose, tagName) {
        level--;
        return elementClose.call(null, tagName);
    });

    //iDOM.elementVoid =

    var elementOpenKey;
    iDOM.elementOpenStart = _.wrap(iDOM.elementOpenStart, function(elementOpenStart, tagName, key, staticArray) {
        elementOpenKey = key;
        elementOpenStart(tagName, key, staticArray);
    });
    iDOM.elementOpenEnd = _.wrap(iDOM.elementOpenEnd, function(elementOpenEnd, tagName) {
        elementHandler(elementOpenEnd, tagName, elementOpenKey);
    });
}

function renderStop(renderData) {
    iDOM.elementOpen = elementOpen;
    iDOM.elementClose = elementClose;
    iDOM.elementOpenStart = elementOpenStart;
    iDOM.elementOpenEnd = elementOpenEnd;

    alignContent(renderData.children, renderData.position);
}

function doTransition(renderData) {
    var rootEl = renderData.rootEl;
    var activeKeys = utils.getNodeData(rootEl).keyMap;
    var transitionOptions = initTransitionOptions(renderData.attrs);
    var children = Array.prototype.slice.call(rootEl.children);

    _.each(children, function(node) {
        var key = utils.getNodeData(node).key;
        var render = utils.getRenderData(node);

        if (renderData.keysToShow[key]) {
            render.status = RenderStatus.ENTER;
            transition.enter(node, transitionOptions, function() {
                render.status = RenderStatus.DONE;
            });
        } else if (!renderData.keysRendered[key]) {
            render.status = RenderStatus.LEAVE;
            transition.leave(node, transitionOptions, function() {
                render.status = RenderStatus.DONE;
                delete activeKeys[key];
                publish(Events.NODE_REMOVED, node);
            });

        } else if (render.status === RenderStatus.LEAVE) {
            render.status = RenderStatus.ENTER;
            transition.enter(node, transitionOptions, function() {
                render.status = RenderStatus.DONE;
            });
        }
    });
}

module.exports = {
    start: renderStart,
    stop: renderStop,
    doTransition: doTransition
};