var STRINGS = {
    pointerDown: 'pointerdown',
    pointerMove: 'pointermove',
    pointerUp: 'pointerup',
    pointerCancel: 'pointercancel',
    pointerOut: 'pointerout',
    touchstart: 'touchstart',
    touchmove: 'touchmove',
    touchend: 'touchend',
    touchleave: 'touchleave',
    touchcancel: 'touchcancel',
    mousedown: 'mousedown',
    mousemove: 'mousemove',
    mouseup: 'mouseup',
    mouseover: 'mouseover',
    mouseout: 'mouseout'
};

if (window.MSPointerEvent && !window.PointerEvent) {
    STRINGS.pointerDown = 'MSPointerDown';
    STRINGS.pointerMove = 'MSPointerMove';
    STRINGS.pointerUp = 'MSPointerUp';
    STRINGS.pointerCancel = 'MSPointerCancel';
    STRINGS.pointerOut = 'MSPointerOut';
}

function PointerTracker(element) {
    this._el = element;
    this.isDown = false;
    this.chancelId = false;
    if (!window.navigator.msPointerEnabled) {
        if (!this.isTouched) {
            this._el.addEventListener(STRINGS.mousedown, this, false);
            this._el.addEventListener(STRINGS.mouseup, this, false);
            this._el.addEventListener(STRINGS.mousemove, this, false);
            this._el.addEventListener(STRINGS.mouseout, this, false);
            this._el.addEventListener(STRINGS.mouseover, this, false);
        } else {
            this._el.addEventListener(STRINGS.touchstart, this, false);
            this._el.addEventListener(STRINGS.touchend, this, false);
            this._el.addEventListener(STRINGS.touchmove, this, false);
            this._el.addEventListener(STRINGS.touchcancel, this, false);
        }

    } else {
        var self = this,
            eventHandlerIE = function (e){
                self.handleEventIE(e);
            },
            eventHandler = function (e){
                self.handleEvent(e);
            };
        if (window.navigator.pointerEnabled) {
            this._el.addEventListener(STRINGS.pointerDown, eventHandlerIE, true);
            this._el.addEventListener(STRINGS.pointerMove, eventHandlerIE, true);
            this._el.addEventListener(STRINGS.pointerUp, eventHandlerIE, true);
        } else {
            this._el.addEventListener(STRINGS.pointerDown, eventHandler, true);
            this._el.addEventListener(STRINGS.pointerMove, eventHandler, true);
            this._el.addEventListener(STRINGS.pointerUp, eventHandler, true);
        }
        this._el.addEventListener(STRINGS.pointerCancel, eventHandler, false);
        this._el.addEventListener(STRINGS.pointerOut, eventHandler, false);
    }

    this.destroy = function () {
        if (!this.isTouched) {
            this._el.removeEventListener(STRINGS.mousedown, this);
            this._el.removeEventListener(STRINGS.mouseup, this);
            this._el.removeEventListener(STRINGS.mousemove, this);
            this._el.removeEventListener(STRINGS.mouseout, this);
            this._el.removeEventListener(STRINGS.mouseover, this);
        } else {
            this._el.removeEventListener(STRINGS.touchstart, this);
            this._el.removeEventListener(STRINGS.touchend, this);
            this._el.removeEventListener(STRINGS.touchmove, this);
            this._el.removeEventListener(STRINGS.touchcancel, this);
        }
        delete this._el;
    };
}
PointerTracker.prototype = {
    EVENTS: {
        up: 'pointerup',
        down: 'pointerdown',
        move: 'pointermove',
        over: 'pointerover',
        chancel: 'pointercancel'
    },
    isTouched: 'ontouchstart' in window || window.navigator.msPointerEnabled,
    handleEventIE: function (e) {
        if (!e.isPrimary) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();
        } else {
            switch (e.type) {
                case STRINGS.pointerDown:
                    this.isDown = true;
                    break;
                case STRINGS.pointerUp:
                case STRINGS.pointerCancel:
                case STRINGS.pointerOut:
                    this.isDown = false;
            }
        }
    },
    handleEvent: function (e) {
        if (this.chancelId !== null) {
            clearTimeout(this.chancelId);
        }
        switch (e.type) {
            case STRINGS.touchmove:
            case STRINGS.mousemove:
            case STRINGS.pointerMove:
                if (this.isDown) {
                    this._fireEvent(this.EVENTS.move, e);
                }
                break;
            case STRINGS.touchstart:
            case STRINGS.mousedown:
            case STRINGS.pointerDown:
                this.isDown = true;
                this.chancelId = false;
                this._fireEvent(this.EVENTS.down, e);
                break;
            case STRINGS.touchend:
            case STRINGS.pointerUp:
            case STRINGS.touchleave:
            case STRINGS.touchcancel:
            case STRINGS.pointerCancel:
            case STRINGS.pointerOut:
            case STRINGS.mouseup:
                if (this.isDown) {
                    this.isDown = !this._fireEvent(this.EVENTS.up, e);
                }
                break;
            case STRINGS.mouseover:
                if (this.isDown) {
                    this._fireEvent(this.EVENTS.over, e);
                }
                break;
            case STRINGS.mouseout:
                var pointerTracker = this;
                if (this.isDown) {
                    this.chancelId = setTimeout(function () {
                        pointerTracker.isDown = false;
                        pointerTracker._fireEvent(pointerTracker.EVENTS.chancel, e);
                        pointerTracker.chancelId = null;
                    }, 10);
                }
                break;
        }
    },
    _fireEvent: function (type, e) {
        var touchEvent = e, i, l, customEvent;
        if (this.isTouched) {
            if (window.navigator.msPointerEnabled) {
                if (!e.isPrimary) {
                    return false;
                }
                touchEvent = e;
                this.touchID = e.pointerId;
            } else if (e.type === STRINGS.touchstart) {
                if (e.touches.length > 1) {
                    return false;
                }
                touchEvent = e.touches[0];
                this.touchID = e.touches[0].identifier;
            } else {
                for (i = 0, l = e.changedTouches.length; i < l; i++) {
                    touchEvent = e.changedTouches[i];
                    if (touchEvent.identifier === this.touchID) {
                        break;
                    }
                }
                if (touchEvent.identifier !== this.touchID) {
                    return false;
                }
            }
        } else {
            this.touchID = 1;
        }
        customEvent = document.createEvent('MouseEvents');
        customEvent.initMouseEvent(type, true, true, window, 1, touchEvent.screenX, touchEvent.screenY, touchEvent.clientX, touchEvent.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button, e.relatedTarget);

        customEvent.preventDefault = function () {
            if (e.preventDefault !== undefined)
                e.preventDefault();
        };
        if (customEvent.stopPropagation !== undefined) {
            var current = customEvent.stopPropagation;
            customEvent.stopPropagation = function () {
                if (e.stopPropagation !== undefined)
                    e.stopPropagation();
                current.call(this);
            };
        }
        customEvent.pointerId = this.touchID;
        customEvent.pointerType = this.isTouched ? 'touch' : 'mouse';
        customEvent.isPrimary = true;

        // direfox dirty hack
        if (customEvent.__defineGetter__){
            customEvent.__defineGetter__('timeStamp', function (){
                return e.timeStamp;
            });
        }

        e.target.dispatchEvent(customEvent);
        return true;
    }
};
if (typeof exports !== 'undefined') {
    exports.module = PointerTracker;
}