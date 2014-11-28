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

function Pager(element, adapter, options) {
    var event, i;

    function createHandler() {
        return {
            element: document.createElement('div'),
            index: null,
            handler: {}
        };
    }

    function mix(obj, mixin) {
        var attr;
        for (attr in mixin) {
            if (mixin.hasOwnProperty(attr)) {
                obj[attr] = mixin[attr];
            }
        }
        return obj;
    }

    this._el = element;
    this._adapter = adapter;
    this._wrapper = document.createElement('div');
    this._pageHandlers = [ createHandler(), createHandler(), createHandler()];
    this._options = mix({
        preventMove: true,  // fix for android
        resizeEvent: true,
        onSwipeEnd: function () {
        }
    }, options);
    this._enabled = true;
    this._gestureKind = null;

    this._wrapper.appendChild(this._pageHandlers[0].element);
    this._wrapper.appendChild(this._pageHandlers[1].element);
    this._wrapper.appendChild(this._pageHandlers[2].element);
    this._el.appendChild(this._wrapper);
    this._applyStyles();

    // clear page containers
    for (i = 0; i < 3; i += 1) {
        this._pageHandlers[i].element.innerHTML = "";
    }

    // prepare content for page containers
    for (i = 0; i < this._adapter.getPageCount() && i < 3; i += 1) {
        this._changePagePosition(i, i);
        this._adapter.setPageContent(i, this._pageHandlers[i].element, this._pageHandlers[i].handler);
    }
    if (this._adapter.getPageCount() > 0) {
        this._options.onSwipeEnd(0);
    }

    for (event in this.TRACKING_EVENTS) {
        if (this.TRACKING_EVENTS.hasOwnProperty(event)) {
            this._el.addEventListener(this.TRACKING_EVENTS[event], this, false);
        }
    }

    if (this._options.resizeEvent) {
        window.addEventListener('resize', this, false);
    }

    this.destroy = function () {
        var e;
        for (e in this.TRACKING_EVENTS) {
            if (this.TRACKING_EVENTS.hasOwnProperty(e)) {
                this._el.removeEventListener(this.TRACKING_EVENTS[e], this);
            }
        }
        window.removeEventListener('resize', this);

        this._el = null;
        this._adapter = null;
        this._wrapper = null;
        this._pageHandlers = null;
    };
}

Pager.prototype = {

    TRACKING_EVENTS: {
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
            tmpVar = validPosition.indexOf(window.getComputedStyle(this._el, null).position);

        function clearElement(element) {
            element.style.position = 'absolute';
            element.style.margin = 0;
            element.style.padding = 0;
            element.style.width = '100%';
            element.style.height = '100%';
            element.style.top = 0;
            element.style.left = 0;
        }

        this._el.style.position = (tmpVar === -1) ? 'relative' : validPosition[tmpVar];
        this._el.style.overflow = 'hidden';

        clearElement(this._wrapper);
        clearElement(this._pageHandlers[0].element);
        clearElement(this._pageHandlers[1].element);
        clearElement(this._pageHandlers[2].element);

        if (typeof this._options.pageClass === 'string') {
            this._pageHandlers[0].element.className = this._options.pageClass;
            this._pageHandlers[1].element.className = this._options.pageClass;
            this._pageHandlers[2].element.className = this._options.pageClass;
        }

        this._wrapperPosition = 0;
        this._wrapperWidth = this._wrapper.offsetWidth;

        this.currentPage = 0;
        this._currentShiftForRaf = 0;
    },

    _pointerDown: function (e) {
        var self = this;

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
                self._changeWrapperPosition(self._currentShiftForRaf);
            }
            self._currentShiftForRaf = 0;
        };

        this._gestureKind = null;
        this._currentShiftForRaf = 0;
    },

    _pointerMove: function (e) {
        var X = (e.originalEvent) ? e.originalEvent.clientX : e.clientX,
            Y = (e.originalEvent) ? e.originalEvent.clientY : e.clientY;

        this._currentShiftForRaf += (X - this._lastX);
        this._lastX = X;

        // check kind of gesture in first time moving
        if (this._gestureKind === null) {
            if (Math.abs(this._currentShiftForRaf) > Math.abs(Y - this._startY) / 2) {
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
        this._gestureKind = null;
        this._tweatID = setTimeout(function () {
            self.swipeTo();
        }, 100);
    },

    _pointerFling: function (e) {
        var event = e.originalEvent || e,
            horizontalFling = Math.abs(event.speedX) > Math.abs(event.speedY),
            direction = (event.speedX < 0) ? "left" : "right";

        if (horizontalFling && Math.abs(event.speedX) > 0.2 && this._enabled) {
            clearTimeout(this._tweatID);
            this.swipeTo(direction);
        }
    },

    _changePagePosition: function (numberInArr, index) {
        this._pageHandlers[numberInArr].element.style.left = index * 100 + '%';
        this._pageHandlers[numberInArr].index = index;
    },

    _changeWrapperPosition: function (shift) {
        var position = this._wrapperPosition + shift;

        if (this._adapter.getPageCount() < 1) {
            return;
        }

        this._wrapper.style[this._transformName] = "translate3d(" + position + "px, 0, 0)";

        this._wrapperPosition = position;
    },

    _replacePage: function (lastDelta) {
        var shift = this._wrapperPosition % this._wrapperWidth,
            countOfPages = this._adapter.getPageCount(),
            viewedNumber = Math.min((shift - this._wrapperPosition) / this._wrapperWidth, countOfPages),
            leftNumber = -1,
            rightNumber = -1,
            leftContainerNumber = -1,
            rightContainerNumber = leftContainerNumber,
            i;

        for (i = 0; i < countOfPages && i < 3; i += 1) {
            if (this._pageHandlers[i].index > rightNumber) {
                rightNumber = this._pageHandlers[i].index;
                rightContainerNumber = i;
                if (leftNumber === -1) {
                    leftNumber = rightNumber;
                    leftContainerNumber = rightContainerNumber;
                }
            }

            if (this._pageHandlers[i].index < leftNumber) {
                leftNumber = this._pageHandlers[i].index;
                leftContainerNumber = i;
            }
        }

        // if we have shift to right
        if ((lastDelta > 0) && (viewedNumber < countOfPages - 1) && (viewedNumber === rightNumber)) {
            this._changePagePosition(leftContainerNumber, viewedNumber + 1);
            this._adapter.setPageContent(viewedNumber + 1, this._pageHandlers[leftContainerNumber].element, this._pageHandlers[leftContainerNumber].handler);
        }

        // if we have shift to left
        if ((lastDelta < 0) && (viewedNumber > 0) && (viewedNumber === leftNumber)) {
            this._changePagePosition(rightContainerNumber, viewedNumber - 1);
            this._adapter.setPageContent(viewedNumber - 1, this._pageHandlers[rightContainerNumber].element, this._pageHandlers[rightContainerNumber].handler);
        }

        // save for future using
        this.currentPage = viewedNumber;
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
        }
    },

    swipeTo: function (direction) {
        var self = this,
            shift = this._wrapperPosition % this._wrapperWidth,
            countOfPages = this._adapter.getPageCount(),
            viewedNumber = Math.min((shift - this._wrapperPosition) / this._wrapperWidth, countOfPages),
            leftNumber = -1,
            rightNumber = -1,
            leftContainerNumber = -1,
            rightContainerNumber = leftContainerNumber,
            i;

        // stop rAF drug animation
        window.cancelAnimationFrame(this._RafID);
        this._inAnimation = false;

        for (i = 0; i < countOfPages && i < 3; i += 1) {
            if (this._pageHandlers[i].index > rightNumber) {
                rightNumber = this._pageHandlers[i].index;
                rightContainerNumber = i;
                if (leftNumber === -1) {
                    leftNumber = rightNumber;
                    leftContainerNumber = rightContainerNumber;
                }
            }

            if (this._pageHandlers[i].index < leftNumber) {
                leftNumber = this._pageHandlers[i].index;
                leftContainerNumber = i;
            }
        }

        // check limitation
        if ((viewedNumber === 0) && ((direction === 'right') || (shift > 0 && Math.abs(shift) > this._wrapperWidth / 2))) {
            direction = 'left';
            shift = this._wrapperPosition - this._wrapperWidth;
        } else if ((viewedNumber === countOfPages - 1) && (direction === 'left' || Math.abs(shift) > this._wrapperWidth / 2)) {
            direction = 'right';
            shift = shift - this._wrapperWidth + this._wrapperWidth;
        }

        // calculate shift
        if ((direction === 'left') || ((direction === undefined) && (Math.abs(shift) > this._wrapperWidth / 2))) {
            shift = -(this._wrapperWidth + shift);
        } else if ((direction === 'right') || ((direction === undefined) && (Math.abs(shift) < this._wrapperWidth / 2))) {
            shift = -shift;
        }

        //prepare css animation
        this._wrapper.style[this._transitionName] = 'all ' + (350 * Math.abs(shift) / this._wrapperWidth) + 'ms ease-in-out';
        this._onTheCSSEnd = function () {
            self._wrapper.removeEventListener(self._transitionEndName, self._onTheCSSEnd);
            self._wrapper.style[self._transitionName] = 'none';

            self._replacePage(-shift);
            self._onTheCSSEnd = null;

            self._options.onSwipeEnd(self.currentPage);
        };

        this._wrapper.addEventListener(this._transitionEndName, this._onTheCSSEnd, false);

        // set position
        this._changeWrapperPosition(shift);
    },

    refresh: function () {
        // stop all
        if (this._onTheCSSEnd) {
            this._onTheCSSEnd();
        }
        clearTimeout(this._tweatID);
        window.cancelAnimationFrame(this._RafID);

        this._wrapperWidth = this._wrapper.offsetWidth;
        this._currentShiftForRaf = 0;

        this.gotoPage(this.currentPage);
    },

    gotoPage: function (number) {
        var central, left, right, countOfPages = this._adapter.getPageCount(), i, handler, pages, page, position;

        if (countOfPages === 0) {
            // clear or containers and return
            for (i = 0; i < 3; i += 1) {
                handler = this._pageHandlers[i];
                handler.element.innerHTML = "";
                handler.index = null;
                handler.handler = {};
            }
            this._options.onSwipeEnd(NaN);
            return;
        }

        //check bounds & setup positions
        if (number < 0) {
            left = 0;
            central = (left + 1 < countOfPages) ? left + 1 : null;
            right = (central + 1 < countOfPages) ? central + 1 : null;
        } else if (number > countOfPages - 1) {
            right = countOfPages - 1;
            central = (right - 1 > -1) ? right - 1 : null;
            left = (central - 1 > -1) ? central - 1 : null;
        } else {
            central = number;
            if (central - 1 > -1) {
                left = central - 1;
            } else if (countOfPages > 2) {
                left = central + 2;
            } else {
                left = null;
            }

            if (central + 1 < countOfPages) {
                right = central + 1;
            } else if (central - 2 > -1) {
                right = central - 2;
            } else {
                right = null;
            }
        }

        // put containers to the places
        pages = [left, central, right];
        for (i = 0; i < 3; i += 1) {
            page = pages[i];
            handler = this._pageHandlers[i];

            if (page === null) {
                handler.element.innerHTML = "";
                handler.index = null;
                handler.handler = {};
            } else {
                handler.index = page;
                this._changePagePosition(i, page);
                this._adapter.setPageContent(page, handler.element, handler.handler);
            }
        }

        // change wrapper position
        position = -(central * this._wrapperWidth);
        this._wrapper.style[this._transformName] = "translate3d(" + position + "px, 0, 0)";
        this._wrapperPosition = position;

        this._options.onSwipeEnd(central);
    },

    enable: function (flag) {
        this._enabled = flag;
    }
};

if (typeof exports !== "undefined") {
    exports.module = Pager;
}