'use strict';

var DEFAULT_LEAVE_CLASS = 'leave';
var DEFAULT_ENTER_CLASS = 'enter';
var DEFAULT_ACTIVE_CLASS = 'animated';
var DEFAULT_TIMEOUT = 3500;


module.exports = function (attrs) {
    var enterTimeout = parseInt(attrs.enterTimeout, 10);
    var leaveTimeout = parseInt(attrs.leaveTimeout, 10);
    var animationName = attrs.name || attrs.animationName;

    return {
        animationEnter: attrs.animationEnter || animationName,
        animationLeave: attrs.animationLeave || animationName,
        initialAnimation: attrs.initialAnimation,

        enterClass: attrs.enterClass || DEFAULT_ENTER_CLASS,
        leaveClass: attrs.leaveClass || DEFAULT_LEAVE_CLASS,

        enterTimeout: isNaN(enterTimeout) ? DEFAULT_TIMEOUT : enterTimeout,
        leaveTimeout: isNaN(leaveTimeout) ? DEFAULT_TIMEOUT : leaveTimeout,

        activeClass: attrs.activeClass || DEFAULT_ACTIVE_CLASS
    };
};