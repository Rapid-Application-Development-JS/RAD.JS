function addVendorPrefix(property) {
    var arr = ["ms", "moz", "webkit", "o"], i, tmp = document.createElement("div"),
        result = property.toLowerCase(), arrayOfPrefixes = [];

    function capitalise(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    for (i = 0; i < arr.length; i += 1) {
        arrayOfPrefixes.push(arr[i] + capitalise(property));
    }

    for (i = 0; i < arrayOfPrefixes.length; i += 1) {
        if (tmp.style[arrayOfPrefixes[i]] !== undefined) {
            result = '-' + arr[i] + '-' + property;
            break;
        }
    }
    return result;
}

window.performance = window.performance || {};
window.performance.now = (function () {
    return performance.now ||
        performance.mozNow ||
        performance.msNow ||
        performance.oNow ||
        performance.webkitNow ||
        function () {
            return new Date().getTime();
        };
}());

(function () {
    var lastTime = 0, x, currTime, timeToCall, id, vendors = ['ms', 'moz', 'webkit', 'o'];
    for (x = 0; x < vendors.length && !window.requestAnimationFrame; x += 1) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
            || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback) {
            currTime = window.performance.now();
            timeToCall = Math.max(0, 16 - (currTime - lastTime));
            id = window.setTimeout(function () {
                callback(currTime + timeToCall);
            }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (id) {
            clearTimeout(id);
        };
    }
}());

function Drawer(wrapper, options) {
    var event;

    function mix(obj, mixin) {
        var attr;
        for (attr in mixin) {
            if (mixin.hasOwnProperty(attr)) {
                obj[attr] = mixin[attr];
            }
        }
        return obj;
    }

    this._wrapper = wrapper;
    this._navigation = wrapper.firstElementChild;
    this._content = this._navigation.nextElementSibling;
    this._options = mix({
        overlay: true,
        overlayOpacity: true,
        overlayBackground: 'rgba(0, 0, 0, 0.4)',
        swipe: true,
        preventMove: true,
        resizeEvent: true,
        maxWidth: '70%',
        startTrackingZone: '20%',
        animationTime: 350,
        onActionEnd: function () {}
    }, options);
    this._enabled = this._options.swipe;

    if (this._options.overlay) {
        this._overlay = document.createElement('div');
        this._content.appendChild(this._overlay);
    }


    this._applyStyles();

    for (event in this.TRACKING_EVENTS) {
        if (this.TRACKING_EVENTS.hasOwnProperty(event)) {
            this._content.addEventListener(this.TRACKING_EVENTS[event], this, false);
        }
    }

    if (this._options.resizeEvent) {
        window.addEventListener('resize', this, false);
    }

    this.destroy = function () {
        var e;
        for (e in this.TRACKING_EVENTS) {
            if (this.TRACKING_EVENTS.hasOwnProperty(e)) {
                this._content.removeEventListener(this.TRACKING_EVENTS[e], this);
            }
        }
        window.removeEventListener('resize', this);

        this._navigation = null;
        this._content = null;
        this._overlay = null;
    };
}

Drawer.prototype = {

    TRACKING_EVENTS: {
        tap: 'tap',
        up: 'pointerup',
        move: 'pointermove',
        down: 'pointerdown',
        chancel: 'pointercancel',
        fling: 'fling'
    },

    preventDefaultTags: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/,

    _transformName: addVendorPrefix("transform"),

    _transitionName: addVendorPrefix("transition"),

    _transitionEndName: addVendorPrefix("transitionEnd") || 'transitionend',

    _applyStyles: function () {
        var validPosition = ['fixed', 'relative', 'absolute'],
            tmpVar = validPosition.indexOf(window.getComputedStyle(this._wrapper, null).position);

        function clearElement(element) {
            element.style.position = 'absolute';
            element.style.margin = 0;
            element.style.padding = 0;
            element.style.width = '100%';
            element.style.height = '100%';
            element.style.top = 0;
            element.style.left = 0;
        }

        this._wrapper.style.position = (tmpVar === -1) ? 'relative' : validPosition[tmpVar];
        this._wrapper.style.overflow = 'hidden';

        clearElement(this._content);
        clearElement(this._navigation);
        this._navigation.style.width = this._options.maxWidth;

        if (this._options.overlay) {
            clearElement(this._overlay);
            this._overlay.style.display = 'none';

            if (this._options.overlayOpacity) {
                this._overlay.style.backgroundColor = this._options.overlayBackground;
                this._overlay.style.opacity = 0;
            }
        }

        this._contentPosition = 0;
        this._maxShift = this._navigation.offsetWidth;
        this._trackingWidth = parseInt(this._options.startTrackingZone, 10) * this._content.offsetWidth / 100;
        this._wrapperWidth = this._wrapper.offsetWidth;
        this._currentShiftForRaf = 0;
        this._isClosed = true;
    },

    _changeContentPosition: function (shift) {
        var position = this._contentPosition + shift;

        this._content.style[this._transformName] = "translate3d(" + position + "px, 0, 0)";
        this._contentPosition = position;

        // change overlay opacity
        if (this._options.overlay && this._options.overlayOpacity) {
            this._overlay.style.opacity = position / this._wrapperWidth;
        }
    },

    _getCoordsInElement: function (e, element) {
        var x = e.pageX || e.clientX + document.body.scrollLeft,
            y = e.pageY || e.clientY + document.body.scrollTop,
            rect = element.getBoundingClientRect();

        x -= rect.left + document.body.scrollLeft;
        y -= rect.top + document.body.scrollTop;

        return {x: x, y: y};
    },

    _pointerDown: function (e) {
        var self = this, touchPoint = this._getCoordsInElement(e, this._content);

        // stop all
        if (this._onTheCSSEnd) {
            this._onTheCSSEnd();
        }
        clearTimeout(this._tweatID);
        window.cancelAnimationFrame(this._RafID);

        this._lastX = (e.originalEvent) ? e.originalEvent.clientX : e.clientX;
        this._startY = (e.originalEvent) ? e.originalEvent.clientY : e.clientY;

        this._animationStep = function () {
            if (self._inAnimation) {
                self._RafID = window.requestAnimationFrame(self._animationStep);
            }

            if (self._enabled) {
                self._changeContentPosition(self._currentShiftForRaf);
            }
            self._currentShiftForRaf = 0;
        };

        this._gestureKind = null;
        this._currentShiftForRaf = 0;


        if (touchPoint.x > this._trackingWidth && this._isClosed === true) {
            this._gestureKind = 'vertical'; // don't track it
        }
    },

    _pointerMove: function (e) {
        var X = (e.originalEvent) ? e.originalEvent.clientX : e.clientX,
            Y = (e.originalEvent) ? e.originalEvent.clientY : e.clientY;

        this._currentShiftForRaf += (X - this._lastX);
        this._lastX = X;

        // check kind of gesture in first time moving
        if (this._gestureKind === null) {
            if (Math.abs(this._currentShiftForRaf) > Math.abs(Y - this._startY) / 2) {
                if (this._options.overlay) {
                    this._overlay.style.display = 'block';
                }
                // this is horizontal moving
                this._inAnimation = true;
                this._RafID = window.requestAnimationFrame(this._animationStep);
                this._gestureKind = 'horizontal';
            } else {
                // this is vertical moving
                this._gestureKind = 'vertical';
            }
        }
    },

    _pointerUp: function () {
        var self = this;

        this._inAnimation = false;
        this._tweatID = setTimeout(function () {
            self._gestureKind = null;
            self._action();
        }, 100);
    },

    _pointerFling: function (e) {
        var event = e.originalEvent || e,
            horizontalFling = Math.abs(event.speedX) > Math.abs(event.speedY),
            direction = (event.speedX < 0) ? "close" : "open";

        if ((horizontalFling && Math.abs(event.speedX) > 0.2 && this._enabled) && (this._gestureKind === 'horizontal')) {
            clearTimeout(this._tweatID);
            this._action(direction);
        }
    },

    _pointerTap: function () {
        if (!this._isClosed) {
            clearTimeout(this._tweatID);
            this._action('close');
        }
    },

    _action: function (activity) {
        var self = this, shift, close = -this._contentPosition, open = this._maxShift - this._contentPosition,
            animTime = this._options.animationTime;

        // stop all
        if (this._onTheCSSEnd) {
            this._onTheCSSEnd();
        }
        clearTimeout(this._tweatID);
        window.cancelAnimationFrame(this._RafID);

        //check activities
        if (typeof activity === 'string') {
            if (activity === 'open') {
                shift = open;
                this._isClosed = false;
            } else {
                shift = close;
                this._isClosed = true;
            }
        } else {
            if (this._contentPosition > this._maxShift / 2) {
                shift = open;
                activity = 'open';
                this._isClosed = false;
            } else {
                shift = close;
                activity = 'close';
                this._isClosed = true;
            }
        }

        //prepare css animation
        this._content.style[this._transitionName] = 'all ' + (animTime * Math.abs(shift) / this._wrapperWidth) + 'ms ease-in-out';
        if (this._options.overlay) {
            this._overlay.style.opacity = this._contentPosition / this._wrapperWidth;
            this._overlay.offsetWidth; //dog bone
            this._overlay.style[this._transitionName] = 'opacity ' + (animTime * Math.abs(shift) / this._wrapperWidth) + 'ms ease-in-out';
            this._overlay.style.opacity = (activity === 'close') ? 0 : 1;
        }

        this._onTheCSSEnd = function () {
            self._onTheCSSEnd = null;
            self._content.removeEventListener(self._transitionEndName, self._onTheCSSEnd);

            self._content.style[self._transitionName] = 'none';

            if (self._options.overlay) {
                self._overlay.style[self._transitionName] = 'none';
                if (activity === 'close') {
                    self._overlay.style.display = 'none';
                } else {
                    self._overlay.style.display = 'block';
                }
            }

            self._options.onActionEnd(self._isClosed);
        };

        this._content.addEventListener(this._transitionEndName, this._onTheCSSEnd, false);

        // set position
        this._changeContentPosition(shift);
    },

    handleEvent: function (e) {
        var self = this;

        switch (e.type) {
        case this.TRACKING_EVENTS.down:
            this._pointerDown(e);
            break;
        case this.TRACKING_EVENTS.move:
            this._pointerMove(e);
            if (this._gestureKind === 'horizontal' && this._options.preventMove && !this.preventDefaultTags.test(e.target)) {
                e.preventDefault();
            }
            break;
        case this.TRACKING_EVENTS.chancel:
        case this.TRACKING_EVENTS.up:
            this._pointerUp(e);
            break;
        case this.TRACKING_EVENTS.fling:
            this._pointerFling(e);
            break;
        case 'resize':
            clearTimeout(this._resizeID);
            this._resizeID = setTimeout(function () {
                self.refresh();
            }, 150);
            break;
        case this.TRACKING_EVENTS.tap:
            this._pointerTap();
            break;
        }
    },

    refresh: function () {
        // stop all
        if (this._onTheCSSEnd) {
            this._onTheCSSEnd();
        }
        clearTimeout(this._tweatID);
        window.cancelAnimationFrame(this._RafID);

        // close menu
        this._isClosed = true;
        if (this._options.overlay) {
            this._overlay.style.display = 'none';
            if (this._options.overlayOpacity) {
                this._overlay.style.opacity = 0;
            }
        }
        this._content.style[this._transformName] = "translate3d(0, 0, 0)";
        this._contentPosition = 0;

        //update parameters
        this._maxShift = this._navigation.offsetWidth;
        this._trackingWidth = parseInt(this._options.startTrackingZone, 10) * this._content.offsetWidth / 100;
        this._wrapperWidth = this._wrapper.offsetWidth;
    },

    setState: function (close) {
        if (this._isClosed !== close) {
            this._overlay.style.display = 'block';
            this._action(close ? 'close' : 'open');
        }
    },

    enable: function (flag) {
        this._enabled = flag;
    }
};

if (typeof exports !== "undefined") {
    exports.module = Drawer;
}