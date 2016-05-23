'use strict';

var TransitionEnd = require('./transitionEnd');
var whichCssEvent = require('./whichCssEvent');
var ANIMATION_DATA = '__animationData';

function AnimationEnd(el) {
    TransitionEnd.call(this, el);
}

AnimationEnd.prototype = Object.create(TransitionEnd.prototype);
AnimationEnd.prototype.constructor = AnimationEnd;

AnimationEnd.prototype._initData = function() {
    this.el[ANIMATION_DATA] = {
        eventName: whichCssEvent({
            "animation"      : "animationend",
            "MozAnimation"   : "animationend",
            "WebkitAnimation": "webkitAnimationEnd"
        }),
        callbacks: []
    };
};

AnimationEnd.prototype._getData = function() {
    return this.el[ANIMATION_DATA];
};

module.exports = AnimationEnd;