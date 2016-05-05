'use strict';

var AnimationEnd = require('../../utils/transition/animationEnd');
var TransitionEnd = require('../../utils/transition/transitionEnd');
var utilsDOM = require('../../utils/DOM_Utils');
var sep = ' ';

function transition(node, options, timeout, callback) {
    var transitionEnd = new TransitionEnd(node);
    var animationEnd = new AnimationEnd(node);

    // Clear uncompleted transitions
    if (node.transitionId) {
        node.stopActiveTransition();
    }

    function done(node) {
        callback(node);

        transitionEnd.unbindAll();
        animationEnd.unbindAll();

        utilsDOM.removeClass(node, [
            options.animationEnter,
            options.animationLeave,
            options.enterClass,
            options.leaveClass,
            options.activeClass
        ].join(sep));
    }

    node.stopActiveTransition = function() {
        transitionEnd.unbindAll();
        animationEnd.unbindAll();
        clearTimeout(node.transitionId);
        node.transitionId = null;
    };


    function onTransitionEnd (e) {
        if (e.target === node) {
            done(node);
            clearTimeout(node.transitionId);
        }
    }

    // handle both animation and transition
    transitionEnd.bind(onTransitionEnd);
    animationEnd.bind(onTransitionEnd);

    if (!timeout) {
        done(node);
        return;
    }

    node.transitionId = setTimeout(function() {
        done(node);
    }, timeout);

    // force reflow
    //window.getComputedStyle(node).width;

    // Run transition
    utilsDOM.addClass(node, options.activeClass);
}

function transitionLeave(node, options, callback) {
    utilsDOM.addClass(node, [
        options.animationLeave,
        options.leaveClass
    ].join(sep));

    utilsDOM.removeClass(node, options.enterClass);

    transition(node, options, options.leaveTimeout, function(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        if (typeof callback === 'function') {
            callback();
        }
    });
}

function transitionEnter(node, options, callback) {

    utilsDOM.addClass(node, [
        options.animationEnter,
        options.enterClass
    ].join(sep));

    utilsDOM.removeClass(node, options.leaveClass);

    transition(node, options, options.enterTimeout, function() {
        if (typeof callback === 'function') {
            callback();
        }
    });
}

module.exports.enter = transitionEnter;
module.exports.leave = transitionLeave;