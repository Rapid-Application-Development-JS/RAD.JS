function GestureAdapter(element, listener) {
    var adapter = this;

    adapter.destroy = function () {
        if (!adapter.isTouched) {
            clearTimeout(adapter.mouseWheelTimeout);

            adapter._el.removeEventListener('mousedown', this);
            adapter._el.removeEventListener('mouseup', this);
            adapter._el.removeEventListener('mousemove', this);
            adapter._el.removeEventListener('mouseout', this);

            // mouse event
            // IE9, Chrome, Safari, Opera
            adapter._el.removeEventListener("mousewheel", adapter);
            // Firefox
            adapter._el.removeEventListener("DOMMouseScroll", adapter);
        } else {
            adapter._el.removeEventListener('touchstart', this);
            adapter._el.removeEventListener('touchend', this);
            adapter._el.removeEventListener('touchmove', this);
            adapter._el.removeEventListener('touchcancel', this);
        }
        delete adapter._el;
        delete adapter._listener;
    };

    adapter._el = element;
    adapter._listener = listener;
    adapter._tmpCoords = {};

    if (!adapter.isTouched) {
        adapter._el.addEventListener('mousedown', adapter, false);
        adapter._el.addEventListener('mouseup', adapter, false);
        adapter._el.addEventListener('mousemove', adapter, false);
        adapter._el.addEventListener('mouseout', adapter, false);
        adapter._el.addEventListener('mouseover', adapter, false);

        // mouse event
        // IE9, Chrome, Safari, Opera
        adapter._el.addEventListener("mousewheel", adapter, false);
        // Firefox
        adapter._el.addEventListener("DOMMouseScroll", adapter, false);
    } else {
        adapter._el.addEventListener('touchstart', adapter, false);
        adapter._el.addEventListener('touchend', adapter, false);
        adapter._el.addEventListener('touchmove', adapter, false);
        adapter._el.addEventListener('touchcancel', adapter, false);
    }

    return adapter;
}

GestureAdapter.prototype = (function () {
    var STRINGS = {
            touchstart: "touchstart",
            touchmove: "touchmove",
            touchend: "touchend",
            touchleave: "touchleave",
            touchcancel: ".touchcancel",
            mousedown: "mousedown",
            mousemove: "mousemove",
            mouseup: "mouseup",
            mouseover: "mouseover",
            mouseout: "mouseout",
            mousewheel: "mousewheel",
            wheel: "DOMMouseScroll",
            horizontal: "horizontal",
            vertical: "vertical",
            fling: "fling",
            tap: "tap",
            longtap: "longtap",
            pointerdown: "pointerdown",
            pointermove: "pointermove",
            pointerup: "pointerup"
        },
        touch = ('ontouchstart' in window),
        eventPool = new Pool(function () {
        }, 100),
        flingPool = new Pool(function () {
            this.start = {};
            this.end = {};
        }, 10),
        extractCoord = (function () {
            if (touch)
                return function (e, cntx) {
                    var touchEvent, i, l;

                    if (e.type === STRINGS.touchstart) {
                        if (e.touches.length > 1){
                            return;
                        }
                        touchEvent = e.touches[0];
                        cntx.touchID = e.touches[0].identifier;
                    } else {
                        for (i = 0, l = e.changedTouches.length; i < l; i ++) {
                            touchEvent = e.changedTouches[i];
                            if (touchEvent.identifier === cntx.touchID) {
                                break;
                            }
                        }
                        if (touchEvent.identifier !== cntx.touchID){
                            return;
                        }
                    }

                    cntx._tmpCoords.screenX = touchEvent.screenX;
                    cntx._tmpCoords.screenY = touchEvent.screenY;
                    cntx._tmpCoords.clientX = touchEvent.clientX;
                    cntx._tmpCoords.clientY = touchEvent.clientY;
                    return cntx._tmpCoords;
                };

            return function (e, cntx) {
                cntx._tmpCoords.screenX = e.screenX;
                cntx._tmpCoords.screenY = e.screenY;
                cntx._tmpCoords.clientX = e.clientX;
                cntx._tmpCoords.clientY = e.clientY;
                return cntx._tmpCoords;
            };
        })();

    function saveLastPoint(e, cntx) {
        if (e.timeStamp - cntx.preLastMove.timeStamp > 10) {
            var coords = extractCoord(e, cntx);
            if (!coords) {
                return;
            }

            cntx.lastMove.screenX = cntx.preLastMove.screenX;
            cntx.lastMove.screenY = cntx.preLastMove.screenY;
            cntx.lastMove.timeStamp = cntx.preLastMove.timeStamp;

            cntx.preLastMove.screenX = coords.screenX;
            cntx.preLastMove.screenY = coords.screenY;
            cntx.preLastMove.timeStamp = e.timeStamp;
        }
    }

    function getDirection(startX, startY, endX, endY) {
        if (Math.abs(startX - endX) > Math.abs(startY - endY)) {
            return STRINGS.horizontal;
        }
        return STRINGS.vertical;
    }

    function fireEvent(type, e, cntx) {
        var coords = extractCoord(e, cntx), event = eventPool.get();
        if (!coords) {
            return;
        }
        event.type = type;
        event.clientX = coords.clientX;
        event.clientY = coords.clientY;
        event.screenX = coords.screenX;
        event.screenY = coords.screenY;
        event.timeStamp = e.timeStamp;
        event.origin = e;

        cntx._listener.handleEvent(event);
    }

    function getDirectionVelocity(lastX, lastY, lastTime, endX, endY, endTime) {
        if (Math.abs(lastX - endX) > Math.abs(lastY - endY)) {
            return (endX - lastX) / (endTime - lastTime);
        } else {
            return (endY - lastY) / (endTime - lastTime);
        }
    }

    function distance(x1, y1, x2, y2) {
        return Math.pow(((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)), 0.5);
    }

    function checkFling(e, cntx) {
        var coord = extractCoord(e, cntx),
            flingEvent;

        if (!coord) {
            return;
        }
        if ((Math.abs(distance(cntx.lastMove.screenX, cntx.lastMove.screenY, coord.screenX, coord.screenY) / (e.timeStamp - cntx.lastMove.timeStamp)) * 100) >> 0 > 0) {
            flingEvent = flingPool.get();
            flingEvent.type = STRINGS.fling;
            //velocity (px/ms) in end point without considering direction
            flingEvent.velocity = distance(cntx.startX, cntx.startY, coord.screenX, coord.screenY) / (e.timeStamp - cntx.timeStamp);
            //fling direction ("vertical", "horizontal")
            flingEvent.direction = getDirection(cntx.startX, cntx.startY, coord.screenX, coord.screenY);
            //fling speed (px/ms) in end point along direction
            flingEvent.speed = getDirectionVelocity(cntx.startX, cntx.startY, cntx.timeStamp, coord.screenX, coord.screenY, e.timeStamp);

            flingEvent.start.screenX = cntx.startX;
            flingEvent.start.screenY = cntx.startY;
            flingEvent.start.clientX = cntx.startClientX;
            flingEvent.start.clientY = cntx.startClientY;
            flingEvent.start.timeStamp = cntx.timeStamp;

            flingEvent.end.screenX = coord.screenX;
            flingEvent.end.screenY = coord.screenY;
            flingEvent.end.clientX = coord.clientX;
            flingEvent.end.clientY = coord.clientY;
            flingEvent.end.timeStamp = e.timeStamp;

            cntx._listener.handleEvent(flingEvent);
        }
    }

    function onTouchStart(e, cntx) {
        var coords = extractCoord(e, cntx);
        if (!coords) {
            return;
        }
        cntx.startX = coords.screenX;
        cntx.startY = coords.screenY;
        cntx.startClientX = coords.clientX;
        cntx.startClientY = coords.clientY;
        cntx.timeStamp = e.timeStamp;
        cntx.moved = false;
        cntx.isDown = true;
        cntx.touchStartTime = e.timeStamp;

        cntx.lastMove = cntx.lastMove || {};
        cntx.preLastMove = cntx.preLastMove || {};

        cntx.lastMove.screenX = cntx.preLastMove.screenX = 0;
        cntx.lastMove.screenY = cntx.preLastMove.screenY = 0;
        cntx.lastMove.timeStamp = cntx.preLastMove.timeStamp = e.timeStamp;

        fireEvent(STRINGS.pointerdown, e, cntx);
    }

    function onTouchMove(e, cntx) {
        var coords = extractCoord(e, cntx);
        if (!coords) {
            return;
        }

        if (cntx.isDown) {
            saveLastPoint(e, cntx);
            fireEvent(STRINGS.pointermove, e, cntx);
            // 10px is tremor distance
            if ((Math.abs(coords.screenY - cntx.startY) > 10) || (Math.abs(coords.screenX - cntx.startX) > 10)) {
                cntx.moved = true;
            }
        }
    }

    function onTouchUp(e, cntx) {
        var duration = e.timeStamp - cntx.touchStartTime;

        if (cntx.isDown) {
            cntx.isDown = false;
            if (!cntx.moved) {
                // if touch duration is more then 300 ms - then it is long tap event
                if (duration <= 300) {
                    fireEvent(STRINGS.tap, e, cntx);
                } else {
                    fireEvent(STRINGS.longtap, e, cntx);
                }
            } else {
                checkFling(e, cntx);
            }
            fireEvent(STRINGS.pointerup, e, cntx);
        }
    }

    function onMouseOver(e, cntx) {
        clearTimeout(cntx.mouseOutTimeout);
    }

    function onMouseOut(e, cntx) {
        cntx.mouseOutTimeout = setTimeout(function () {
            onTouchUp(e, cntx);
        }, 10);
    }

    function onMouseWheel(e, cntx) {
        var startDelta = 10 * ((e.wheelDelta || -e.detail) > 0 ? 1 : -1);

        clearTimeout(cntx.mouseWheelTimeout);

        e.preventDefault();
        e.stopPropagation();

        e = {
            clientX: e.clientX,
            clientY: e.clientY,
            screenX: e.screenX,
            screenY: 0,
            timeStamp: e.timeStamp,

            preventDefault: function () {
            },
            stopPropagation: function () {
            }
        };

        if (!cntx.isDown) {
            cntx.isDown = true;
            cntx.moved = true;

            //special parameters for wheel
            cntx.useMouseWheel = true;
            cntx.currentWheelPosition = 0;
            cntx.acceleration = startDelta;

            onTouchStart(e, cntx);
        }

        cntx.acceleration *=1.2;
        cntx.currentWheelPosition += cntx.acceleration;
        e.screenY = cntx.currentWheelPosition;
        onTouchMove(e, cntx);

        cntx.mouseWheelTimeout = setTimeout(function(){
            fireEvent(STRINGS.pointerup, e, cntx);
            cntx.isDown = false;
            cntx.moved = false;

            //special parameters for wheel
            cntx.useMouseWheel = false;
        }, 200);
    }

    return {
        isTouched: touch,

        handleEvent: function (event) {
            switch (event.type) {
                case STRINGS.touchmove:
                case STRINGS.mousemove:
                    if (!this.useMouseWheel)
                        onTouchMove(event, this);
                    break;
                case STRINGS.touchstart:
                case STRINGS.mousedown:
                    onTouchStart(event, this);
                    break;
                case STRINGS.touchend:
                case STRINGS.touchleave:
                case STRINGS.touchcancel:
                case STRINGS.mouseup:
                    onTouchUp(event, this);
                    break;
                case STRINGS.mouseover:
                    onMouseOver(event, this);
                    break;
                case STRINGS.mouseout:
                    onMouseOut(event, this);
                    break;
                case STRINGS.wheel:
                case STRINGS.mousewheel:
                    onMouseWheel(event, this);
                    break;
            }
        }
    };
}());