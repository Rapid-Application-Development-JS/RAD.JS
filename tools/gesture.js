function GestureTracker(element) {
    var attr, tracker = this;

    function onReady(callback) {
        var addListener = document.addEventListener || document.attachEvent,
            removeListener = document.removeEventListener || document.detachEvent,
            eventName = document.addEventListener ? "DOMContentLoaded" : "onreadystatechange";

        if (document.body) {
            callback();
        } else {
            addListener.call(document, eventName, function () {
                removeListener(eventName, arguments.callee, false);
                callback();
            }, false)
        }
    }

    this._el = element;

    for (attr in this.TRACK_EVENTS) {
        if (this.TRACK_EVENTS.hasOwnProperty(attr)) {
            this._el.addEventListener(this.TRACK_EVENTS[attr], this, false);
        }
    }

    this.destroy = function () {
        for (attr in this.TRACK_EVENTS) {
            if (this.TRACK_EVENTS.hasOwnProperty(attr)) {
                this._el.removeEventListener(this.TRACK_EVENTS[attr], this);
            }
        }

        this._el = null;
    };

    this.MOVE_LIMIT = 10;
    onReady(function () {
        var element = document.createElement('div'), ppi, dpi;
        element.style.position = 'absolute';
        element.style.height = '1in';
        element.style.width = '1in';
        element.style.top = '-100%';
        element.style.left = '-100%';
        document.body.appendChild(element);
        ppi = element.offsetHeight;
        document.body.removeChild(element);
        dpi = ppi * devicePixelRatio * screen.pixelDepth / 24;
        tracker.MOVE_LIMIT = dpi / 6;
    });
}

GestureTracker.prototype = {

    HOLD_TIMEOUT: 350,

    TRACK_EVENTS: {
        up: "pointerup",
        down: "pointerdown",
        move: "pointermove",
        over: "pointerover",
        chancel: "pointercancel"
    },

    tracks: {},

    handleEvent: function (e) {
        switch (e.type) {
        case this.TRACK_EVENTS.down:
            this._pointerDown(e);
            break;
        case this.TRACK_EVENTS.move:
            this._pointerMove(e);
            break;
        case this.TRACK_EVENTS.chancel:
        case this.TRACK_EVENTS.up:
            this._pointerUp(e);
            break;
        }
    },

    _pointerDown: function (e) {
        var gesture = this;
        clearTimeout(this._holdID);
        this._holdID = setTimeout(function(){
            gesture._fireEvent('hold', e);
        }, this.HOLD_TIMEOUT);

        this.tracks[e.pointerId] = {
            start: {
                clientX: e.clientX,
                clientY: e.clientY,
                timeStamp: e.timeStamp
            },
            pre: {
                clientX: e.clientX,
                clientY: e.clientY,
                timeStamp: e.timeStamp
            },
            last: {
                clientX: e.clientX,
                clientY: e.clientY,
                timeStamp: e.timeStamp
            },
            end: {
                clientX: e.clientX,
                clientY: e.clientY,
                timeStamp: e.timeStamp
            }
        };
    },

    _pointerMove: function (e) {
        var isMovedByX, isMovedByY;
        if (this.tracks && this.tracks[e.pointerId] && e.timeStamp - this.tracks[e.pointerId].last.timeStamp > 10) {

            isMovedByX = this.tracks[e.pointerId].last.clientX - this.tracks[e.pointerId].pre.clientX > this.MOVE_LIMIT;
            isMovedByY = this.tracks[e.pointerId].last.clientY - this.tracks[e.pointerId].pre.clientY > this.MOVE_LIMIT;
            if (isMovedByX || isMovedByY) {
                clearTimeout(this._holdID);
            }

            this.tracks[e.pointerId].pre.clientX = this.tracks[e.pointerId].last.clientX;
            this.tracks[e.pointerId].pre.clientY = this.tracks[e.pointerId].last.clientY;
            this.tracks[e.pointerId].pre.timeStamp = this.tracks[e.pointerId].last.timeStamp;

            this.tracks[e.pointerId].last.clientX = e.clientX;
            this.tracks[e.pointerId].last.clientY = e.clientY;
            this.tracks[e.pointerId].last.timeStamp = e.timeStamp;
        }
    },

    _pointerUp: function (e) {
        clearTimeout(this._holdID);
        if (!this.tracks || !this.tracks[e.pointerId]) {
            return;
        }

        this.tracks[e.pointerId].end.clientX = e.clientX;
        this.tracks[e.pointerId].end.clientY = e.clientY;
        this.tracks[e.pointerId].end.timeStamp = e.timeStamp;

        this._checkGesture(e);
        this.tracks[e.pointerId] = null;
    },

    _checkGesture: function (e) {
        var isMoved, isFling, pointerId = e.pointerId, pointer = this.tracks[pointerId];

        function distance(x1, x2, y1, y2) {
            return Math.pow(((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)), 0.5);
        }

        isMoved = Math.abs(distance(pointer.start.clientX, pointer.end.clientX, pointer.start.clientY, pointer.end.clientY)) > 20;
        isFling = Math.abs(distance(pointer.end.clientX, pointer.pre.clientX, pointer.end.clientY, pointer.pre.clientY)) > 0 && pointer.end.timeStamp - pointer.start.timeStamp > 50;
        if (isFling) {
            this._fireEvent('fling', e, {
                start: pointer.start,
                end: pointer.end,
                speedX: (pointer.end.clientX - pointer.pre.clientX) / (pointer.end.timeStamp - pointer.pre.timeStamp),
                speedY: (pointer.end.clientY - pointer.pre.clientY) / (pointer.end.timeStamp - pointer.pre.timeStamp)
            });
        } else if (!isMoved) {
            if (pointer.end.timeStamp - pointer.start.timeStamp > 300) {
                this._fireEvent('longtap', e);
            } else {
                this._fireEvent('tap', e);
            }
        }
    },

    _fireEvent: function (type, e, addiction) {
        var attr, customEvent = document.createEvent('MouseEvents');
        customEvent.initMouseEvent(type, true, true, window, 1, e.screenX, e.screenY,
            e.clientX, e.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.button,
            e.relatedTarget);

        // event attributes
        customEvent.pointerId = this.touchID;
        customEvent.pointerType = e.pointerType;
        if (addiction) {
            for (attr in addiction) {
                if (addiction.hasOwnProperty(attr)) {
                    customEvent[attr] = addiction[attr];
                }
            }
        }

        e.target.dispatchEvent(customEvent);
    }
};

if (typeof exports !== "undefined") {
    exports.module = GestureTracker;
}