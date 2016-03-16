'use strict';

var DEFAULT_LEAVE_CLASS = 'leave';
var DEFAULT_ENTER_CLASS = 'enter';
var DEFAULT_ACTIVE_CLASS = 'animated';
var DEFAULT_TIMEOUT = 3500;


module.exports = function (attrs) {
    return {
        name: attrs.name,

        enterClass: attrs.enterClass || DEFAULT_ENTER_CLASS,
        leaveClass: attrs.leaveClass || DEFAULT_LEAVE_CLASS,

        enterTimeout: parseInt(attrs.enterTimeout, 10) || DEFAULT_TIMEOUT,
        leaveTimeout: parseInt(attrs.leaveTimeout, 10) || DEFAULT_TIMEOUT,

        activeClass: attrs.activeClass || DEFAULT_ACTIVE_CLASS
    };
};