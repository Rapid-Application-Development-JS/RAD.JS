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

function ScrollView(element, options) {
    var scrollView = this, validPosition, tmpVar, event;

    function mix(obj, mixin) {
        var attr;
        for (attr in mixin) {
            if (mixin.hasOwnProperty(attr)) {
                obj[attr] = mixin[attr];
            }
        }
        return obj;
    }

    // initialize inner variables on creation
    this._transitionArray = ["translate(", 0, "px, ", 0, "px) translateZ(0) scale(1)"];
    this._animParams = null; //move or not in current time scrolling view
    this._RafID = null; // ID of request animation frame
    this._lastPointerPosition = {X: 0, Y: 0}; // position of touch pointer, when is touched
    this._shift = {X: 0, Y: 0}; //shift for next RAF tick
    this._motionType = this._lastMotionType = this._STRINGS.stop;
    this._isMoved = false;
    this._isChanceled = false;
    this._tmp = {shiftX: 0, shiftY: 0, now: 0, easing: 0};

    // initialize public variables on creation
    this._pos = {X: 0, Y: 0};
    this._wrapper = element;
    this._el = element.firstElementChild;

    // options for current instance of scrollview
    this._options = mix({
        preventMove: true,
        resizeEvent: true,
        'scrollX': true,
        'scrollY': true,
        'boundsX': false,
        'boundsY': false,
        onScroll: function (shiftX, shiftY) {
        },
        onScrollBefore: function (shiftX, shiftY) {
            return true;
        },
        onScrollAfter: function () {
        },
        onScrollChancel: function () {
        },
        onScrollTypeChange: function (type) {
        },
    }, options);

    // prepare environment
    validPosition = ['fixed', 'relative', 'absolute'];
    tmpVar = validPosition.indexOf(window.getComputedStyle(element, null).position);
    this._wrapper.style.position = (tmpVar === -1) ? 'relative' : validPosition[tmpVar];
    this._wrapper.style.overflow = 'hidden';

    this._el.style.margin = 0;
    this._el.style.position = 'absolute';
    this._el.style[this._transitionName] = 'transform 0ms';

    for (event in this.TRACKING_EVENTS) {
        if (this.TRACKING_EVENTS.hasOwnProperty(event)) {
            this._wrapper.addEventListener(this.TRACKING_EVENTS[event], this, false);
        }
    }

    if (this._options.resizeEvent) {
        window.addEventListener('resize', this, false);
    }

    // animation step function
    this._animationStep = function (timestamp) {
        scrollView._calculateShift(timestamp);

        // callback onScrollBefore and permissions
        if (((scrollView._shift.X !== 0) || (scrollView._shift.Y !== 0)) && (!scrollView._isMoved)) {
            if (!scrollView._options.onScrollBefore(scrollView._shift.X, scrollView._shift.Y)) {
                scrollView._shift.X = 0;
                scrollView._shift.Y = 0;
                scrollView._motionType = scrollView._STRINGS.stop;
            }
        }

        // check permissions of scrolling
        scrollView._shift.X = scrollView._options.scrollX ? scrollView._shift.X : 0;
        scrollView._shift.Y = scrollView._options.scrollY ? scrollView._shift.Y : 0;

        // apply changes of coords
        scrollView._pos.X -= scrollView._shift.X;
        scrollView._pos.Y -= scrollView._shift.Y;

        scrollView._checkBounds();

        // apply changes of coords
        scrollView._transitionArray[1] = scrollView._pos.X;
        scrollView._transitionArray[3] = scrollView._pos.Y;

        // ================== check onScrollChancel, onScroll, onScrollTypeChange, onScrollAfter callbacks ======
        if (scrollView._isChanceled) {
            scrollView._options.onScrollChancel();
            scrollView._isChanceled = false;
        }

        // call onScroll callback if position was changed
        if ((scrollView._shift.X !== 0) || (scrollView._shift.Y !== 0)) {
            scrollView._isMoved = true;
            scrollView._isChanceled = false;
            scrollView._options.onScroll(scrollView._shift.X, scrollView._shift.Y);

            // call onScrollTypeChange callback if type of motion was changed
            if ((scrollView._lastMotionType !== scrollView._motionType) && (scrollView._motionType !== scrollView._STRINGS.checkTweak) && (scrollView._motionType !== scrollView._STRINGS.stop)) {
                scrollView._options.onScrollTypeChange(scrollView._motionType);
                scrollView._lastMotionType = scrollView._motionType;
            }
        }

        if ((scrollView._motionType === scrollView._STRINGS.stop) && scrollView._isMoved) {
            scrollView._options.onScrollAfter();
        }
        // =========================================================================================================

        // endpoint round or post next loop
        if (scrollView._motionType === scrollView._STRINGS.stop) {
            scrollView._transitionArray[1] = Math.round(scrollView._transitionArray[1]);
            scrollView._transitionArray[3] = Math.round(scrollView._transitionArray[3]);
            scrollView._isMoved = false;
        } else { // post next step if widget on touch
            scrollView._RafID = window.requestAnimationFrame(scrollView._animationStep);
        }

        // apply shifts
        scrollView._el.style[scrollView._transformName] = scrollView._transitionArray.join("");

        // clear shifts
        scrollView._shift.X = 0;
        scrollView._shift.Y = 0;
    };

    // start
    this.refresh();
}

ScrollView.prototype = {

    TRACKING_EVENTS: {
        up: 'pointerup',
        move: 'pointermove',
        down: 'pointerdown',
        chancel: 'pointercancel',
        fling: 'fling'
    },

    _sign: function (x) {
        return typeof x === 'number' ? x ? x < 0 ? -1 : 1 : x === x ? 0 : NaN : NaN;
    },

    _STRINGS: {
        tweak: 'tweak',
        checkTweak: 'checkTweak',
        stop: 'stop',
        scroll: 'scroll',
        fling: 'fling',
        move: 'move',
        vertical: 'vertical',
        pointerdown: 'pointerdown',
        pointermove: 'pointermove',
        pointerup: 'pointerup'
    },

    _transitionName: addVendorPrefix("transition"),

    _transformName: addVendorPrefix("transform"),

    _decreaseVelocity: function (v, a, dellta) {
        var result = v + a * dellta;
        return (this._sign(result) !== this._sign(v)) ? 0 : result;
    },

    _calculateShift: function (now) {
        this._tmp.shiftX = 0;
        this._tmp.shiftY = 0;
        this._tmp.now = 0;
        this._tmp.easing = 0;

        // if it first time of RAF loop - save timestamp for calculations
        if (this._animParams.startTime === null) {
            this._animParams.startTime = now;
            this._animParams.lastTime = now;
        }

        // different types of moves
        switch (this._motionType) {
        case this._STRINGS.move:
            this._shift.X /= ((this._pos.X < this._Xmin) || (this._pos.X > this._Xmax)) ? 3 : 1;
            this._shift.Y /= ((this._pos.Y < this._Ymin) || (this._pos.Y > this._Ymax)) ? 3 : 1;
            break;
        case this._STRINGS.fling:
            // setup shift value
            this._shift.X = this._animParams.velocityX * (now - this._animParams.lastTime);
            this._shift.Y = this._animParams.velocityY * (now - this._animParams.lastTime);

            // decrease velocity
            this._animParams.velocityX = this._decreaseVelocity(this._animParams.velocityX, this._animParams.ax, now - this._animParams.startTime);
            this._animParams.velocityY = this._decreaseVelocity(this._animParams.velocityY, this._animParams.ay, now - this._animParams.startTime);

            // decrease velocity when scroller out of borders
            if ((this._pos.X < this._Xmin) && (this._animParams.velocityX > 0)) {
                this._animParams.velocityX += (-this._animParams.velocityX * 0.6);
                if (Math.abs(this._shift.X) < 0.1) {
                    this._animParams.velocityX = 0;
                }
            }
            if ((this._pos.X > this._Xmax) && (this._animParams.velocityX < 0)) {
                this._animParams.velocityX += (-this._animParams.velocityX * 0.6);
                if (Math.abs(this._shift.X) < 0.1) {
                    this._animParams.velocityX = 0;
                }
            }
            if ((this._pos.Y < this._Ymin) && (this._animParams.velocityY > 0)) {
                this._animParams.velocityY += (-this._animParams.velocityY * 0.6);
                if (Math.abs(this._shift.Y) < 0.1) {
                    this._animParams.velocityY = 0;
                }
            }
            if ((this._pos.Y > this._Ymax) && (this._animParams.velocityY < 0)) {
                this._animParams.velocityY += (-this._animParams.velocityY * 0.6);
                if (Math.abs(this._shift.Y) < 0.1) {
                    this._animParams.velocityY = 0;
                }
            }

            // stop fling when velocities == 0
            if ((this._animParams.velocityX === 0) && (this._animParams.velocityY === 0)) {
                this._motionType = this._STRINGS.checkTweak;
            }
            break;
        case this._STRINGS.tweak:
        case this._STRINGS.scroll:
            // setup shift value
            if (this._animParams.duration === 0) { // 0 delay case
                this._shift.X = this._animParams.shiftX;
                this._shift.Y = this._animParams.shiftY;
            } else {
                this._tmp.now = (now - this._animParams.startTime) / this._animParams.duration;
                this._tmp.easing = this.easeFunc(this._tmp.now);
                this._tmp.shiftX = this._animParams.shiftX * this._tmp.easing;
                this._tmp.shiftY = this._animParams.shiftY * this._tmp.easing;

                this._shift.X = this._tmp.shiftX - this._animParams.lastShiftX;
                this._shift.Y = this._tmp.shiftY - this._animParams.lastShiftY;
            }

            if ((this._tmp.now >= 1) || (this._animParams.duration === 0)) {
                if (this._motionType === this._STRINGS.tweak) {
                    this._shift.X = this._animParams.shiftX - this._animParams.lastShiftX;
                    this._shift.Y = this._animParams.shiftY - this._animParams.lastShiftY;

                    this._motionType = this._STRINGS.stop;
                } else {
                    this._motionType = this._STRINGS.checkTweak;
                }
            }

            this._animParams.lastShiftX = this._tmp.shiftX;
            this._animParams.lastShiftY = this._tmp.shiftY;
            break;
        case this._STRINGS.checkTweak:
            this._tmp.shiftX = (this._pos.X > this._Xmax) ? this._Xmax - this._pos.X : (this._pos.X < this._Xmin) ? this._Xmin - this._pos.X : 0;
            this._tmp.shiftY = (this._pos.Y > this._Ymax) ? this._Ymax - this._pos.Y : (this._pos.Y < this._Ymin) ? this._Ymin - this._pos.Y : 0;
            this._animParams = {
                shiftX: -this._tmp.shiftX,
                shiftY: -this._tmp.shiftY,
                lastShiftX: 0,
                lastShiftY: 0,
                duration: 250,
                startTime: now,
                lastTime: null
            };

            this._motionType = (this._tmp.shiftX !== 0 || this._tmp.shiftY !== 0) ? this._STRINGS.tweak : this._STRINGS.stop;
            break;
        }
        this._animParams.lastTime = now;
    },

    _checkBounds: function () {
        var tmpVar = 0;

        //check X bounds
        if (this._pos.X < this._Xmin - this._margine.X) {
            this._pos.X = this._Xmin - this._margine.X;
            tmpVar += 1;
        }
        if (this._pos.X > this._Xmax + this._margine.X) {
            this._pos.X = this._Xmax + this._margine.X;
            tmpVar += 1;
        }

        //check Y bounds
        if (this._pos.Y < this._Ymin - this._margine.Y) {
            this._pos.Y = this._Ymin - this._margine.Y;
            tmpVar += 1;
        }
        if (this._pos.Y > this._Ymax + this._margine.Y) {
            this._pos.Y = this._Ymax + this._margine.Y;
            tmpVar += 1;
        }

        if ((tmpVar >= 3) && (this._motionType !== this._STRINGS.stop)) {
            this._motionType = this._STRINGS.checkTweak;
        }
    },

    _eventPointerDown: function (e) {
        // stop any animations
        window.cancelAnimationFrame(this._RafID);

        if (this._motionType !== this._STRINGS.stop) {
            this._isChanceled = true;
        }

        //save current position for next loop of RAF
        this._lastPointerPosition.X = e.screenX;
        this._lastPointerPosition.Y = e.screenY;

        //start looping by RAF
        this._animParams = {};
        this._motionType = this._STRINGS.move;
        this._RafID = window.requestAnimationFrame(this._animationStep);
    },

    _eventPointerMove: function (e) {
        this._shift.X += this._lastPointerPosition.X - e.screenX;
        this._shift.Y += this._lastPointerPosition.Y - e.screenY;
        this._lastPointerPosition.X = e.screenX;
        this._lastPointerPosition.Y = e.screenY;
    },

    _eventPointerUp: function (e) {
        if (this._motionType !== this._STRINGS.fling) {
            this._motionType = this._STRINGS.checkTweak;
        }
        this._eventPointerMove(e);
    },

    _eventFling: function (e) {
        var Vx = -e.speedX,
            Vy = -e.speedY;

        Vx = this._options.scrollX ? Vx : 0;
        Vy = this._options.scrollY ? Vy : 0;
        this._animParams = {
            velocityX: Vx,
            velocityY: Vy,
            ax: -this._sign(Vx) * 0.00009,
            ay: -this._sign(Vy) * 0.00009,
            startTime: null,
            lastTime: null
        };
        this._motionType = this._STRINGS.fling;
    },

    // =================================== public attributes and methods ===================================
    preventDefaultTags: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/,

    easeFunc: function (t) {
        return t * (2 - t);
    },

    destroy: function () {
        var e;
        for (e in this.TRACKING_EVENTS) {
            if (this.TRACKING_EVENTS.hasOwnProperty(e)) {
                this._wrapper.removeEventListener(this.TRACKING_EVENTS[e], this);
            }
        }
        window.removeEventListener('resize', this);

        window.cancelAnimationFrame(this._RafID);
        this._wrapper = null;
        this._el = null;
        this._options = null;
    },

    refresh: function () {
        this._rootWidth = this._wrapper.offsetWidth;
        this._rootHeight = this._wrapper.offsetHeight;
        this._Xmin = this._rootWidth - this._el.clientWidth;
        this._Ymin = this._rootHeight - this._el.clientHeight;
        this._Xmax = 0;
        this._Ymax = 0;

        this._margine = {};
        this._margine.X = (this._options.boundsX) ? Math.round(this._rootWidth / 3) : 0;
        this._margine.Y = (this._options.boundsY) ? Math.round(this._rootHeight / 3) : 0;

        this._motionType = this._STRINGS.checkTweak;
        this._animParams = {};
        this._RafID = window.requestAnimationFrame(this._animationStep);
    },

    scroll: function (shiftX, shiftY, duration) {
        var durationX = 0, durationY = 0, newShiftX, newShiftY;

        // check horizontal bounds
        if (shiftX !== 0) {
            if (this._pos.X + shiftX < this._Xmin) {
                newShiftX = this._Xmin - this._pos.X;
                durationX = Math.abs(Math.round(duration * newShiftX / shiftX));
                shiftX = newShiftX;

            } else if (this._pos.X - shiftX < this._Xmax) {
                newShiftX = -this._pos.X;
                durationX = Math.abs(Math.round(duration * newShiftX / shiftX));
                shiftX = newShiftX;
            }
        }

        // check vertical bounds
        if (shiftY !== 0) {
            if (this._pos.Y + shiftY < this._Ymin) {
                newShiftY = this._Ymin - this._pos.Y;
                durationY = Math.abs(Math.round(duration * newShiftY / shiftY));
                shiftY = newShiftY;

            } else if (this._pos.Y - shiftY < this._Ymax) {
                newShiftY = -this._pos.Y;
                durationY = Math.abs(Math.round(duration * newShiftY / shiftY));
                shiftY = newShiftY;
            }
        }

        duration = Math.max(durationX, durationY);
        shiftX = this._options.scrollX ? shiftX : 0;
        shiftY = this._options.scrollY ? shiftY : 0;

        //start looping by RAF
        this._motionType = this._STRINGS.scroll;
        this._animParams = {
            shiftX: -shiftX,
            shiftY: -shiftY,
            lastShiftX: 0,
            lastShiftY: 0,
            duration: duration,
            startTime: null,
            lastTime: null
        };
        this._RafID = window.requestAnimationFrame(this._animationStep);
    },

    handleEvent: function (e) {
        var self = this;

        switch (e.type) {
        case this._STRINGS.pointerdown:
            this._eventPointerDown(e);
            break;
        case this._STRINGS.pointermove:
            this._eventPointerMove(e);
            if (this._options.preventMove && !this.preventDefaultTags.test(e.target)) {
                e.preventDefault();
            }
            break;
        case this._STRINGS.pointerup:
            this._eventPointerUp(e);
            break;
        case this._STRINGS.fling:
            this._eventFling(e);
            break;
        case 'resize':
            clearTimeout(this._resizeID);
            this._resizeID = setTimeout(function () {
                self.refresh();
            }, 150);
            break;
        }
    }
};

if (typeof exports !== "undefined") {
    exports.module = ScrollView;
}