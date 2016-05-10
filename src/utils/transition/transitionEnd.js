'use strict';

var whichCssEvent = require('./whichCssEvent');
var TRANSITION_DATA = '__transitionData';

function TransitionEnd(el) {
    this.el = el && (el[0] || el);

    if (!(this.el instanceof HTMLElement)) {
        throw new Error('HTMLElement must be passed as an argument');
    }

    if (!this._getData()) {
        this._initData();
    }
}

TransitionEnd.prototype._initData = function() {
    this.el[TRANSITION_DATA] = {
        eventName: whichCssEvent({
            'transition'      :'transitionend',
            'MozTransition'   :'transitionend',
            'WebkitTransition':'webkitTransitionEnd'
        }),
        callbacks: []
    };
};

TransitionEnd.prototype._getData = function() {
    return this.el[TRANSITION_DATA];
};

TransitionEnd.prototype.bind = function(fn) {
    var data = this._getData();

    if (data.callbacks.indexOf(fn) === -1) {
        data.callbacks.push(fn);
        this.el.addEventListener(data.eventName, fn, false);
    }
};

TransitionEnd.prototype.unbind = function(fn) {
    var data = this._getData(),
        index = data.callbacks.indexOf(fn);

    if (index !== -1) {
        data.callbacks.splice(index, 1);
        this.el.removeEventListener(data.eventName, fn, false);
    }
};

TransitionEnd.prototype.unbindAll = function() {
    this._getData().callbacks.forEach(this.unbind, this);
};


module.exports = TransitionEnd;