'use strict';

var _ = require('underscore');
var publish = require('../../core/dispatcher').publish;
var iDOM = require('../../template/idom');
var Events = require('../../config').Events;
var utils = require('./utils');
var transition = require('./transition');
var initTransitionOptions = require('./options');

var RenderStatus = {
    ENTER: 'enter',
    LEAVE: 'leave',
    DONE: 'done'
};

var isPlaceholder = false;

function createPlaceholder(node) {
    var key = utils.getNodeData(node).key;
    var tagName = node.tagName.toLowerCase();
    isPlaceholder = true;
    iDOM.elementOpen.apply(null, [tagName, key, null].concat( utils.getNodeData(node).attrsArr ));
    iDOM.skip();
    iDOM.elementClose(tagName);
    isPlaceholder = false;
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
    var isNewChild = false;

    function beforeCreate(tagName, key) {
        if (isPlaceholder) {
            return;
        }

        var isChild = (++level) === childLevel;
        isNewChild = false;

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
    }
    function afterCreate(tagName, key) {
        if (isPlaceholder) {
            return;
        }

        var isChild = level === childLevel;
        var node = iDOM.currentElement();

        if (isChild) {
            renderData.keysRendered[key] = node;
        }
        if (isNewChild) {
            children.splice(position - 1, 0, node);
            keyMap[key] = node;
            renderData.keysToShow[key] = node;
        }

        renderData.position = position;
    }

    iDOM.events.on('elementOpen:before', beforeCreate, renderData);
    iDOM.events.on('elementOpen:after', afterCreate, renderData);
    iDOM.events.on('elementClose:after', function() {
        if (!isPlaceholder) {
            level--;
        }
    }, renderData);

    var elementOpenKey;
    iDOM.events.on('elementOpenStart:before', function(tagName, key) {
        if (!isPlaceholder) {
            elementOpenKey = key;
            beforeCreate(tagName, key);
        }
    }, renderData);

    iDOM.events.on('elementOpenEnd:after', function(tagName, key) {
        if (!isPlaceholder) {
            afterCreate(tagName, elementOpenKey);
        }
    }, renderData);
}

function renderStop(renderData) {
    iDOM.events.off(null, null, renderData);

    alignContent(renderData.children, renderData.position);
}

function doTransition(renderData, runner) {
    var rootEl = renderData.rootEl;
    var activeKeys = utils.getNodeData(rootEl).keyMap;
    var transitionOptions = initTransitionOptions(renderData.attrs);
    var children = Array.prototype.slice.call(rootEl.children);

    if (!renderData.applyAnimation) {
        transitionOptions.enterTimeout = transitionOptions.leaveTimeout = 0;
    }

    _.each(children, function(node) {
        var key = utils.getNodeData(node).key;
        var render = utils.getRenderData(node);

        if (!renderData.keysRendered[key]) {
            if (render.status !== RenderStatus.LEAVE) {
                render.status = RenderStatus.LEAVE;
                transition.leave(node, transitionOptions, function() {
                    render.status = RenderStatus.DONE;
                    delete activeKeys[key];
                    publish(Events.NODE_REMOVED, node, runner);
                }, runner);
           }
        } else if (renderData.keysToShow[key] || render.status === RenderStatus.LEAVE) {
            if (render.status !== RenderStatus.ENTER) {
            render.status = RenderStatus.ENTER;
                transition.enter(node, transitionOptions, function () {
                    render.status = RenderStatus.DONE;
                }, runner);
            }
        }
    });
}

module.exports = {
    start: renderStart,
    stop: renderStop,
    doTransition: doTransition
};