RAD.plugin("plugin.fastclick", function (core) {
    'use strict';
    var self = this;

    function Swiper(element) {
        var swiper = this,
            lastMove,
            TOUCH_DIFFERENCE = 20,
            preLastMove;

        function extractCoord(e) {
            var result = {},
                touchEvent = e;

            if (swiper.touch) {
                if (e.touches && e.touches[0] && e.type !== "touchend") {
                    touchEvent = e.touches[0];
                } else if (e.changedTouches && e.changedTouches[0]) {
                    touchEvent = e.changedTouches[0];
                }
            }

            result.screenX = touchEvent.screenX;
            result.screenY = touchEvent.screenY;
            result.clientX = touchEvent.clientX;
            result.clientY = touchEvent.clientY;
            return result;
        }

        function getDirection(startX, startY, endX, endY) {
            var result;

            if (Math.abs(startX - endX) > Math.abs(startY - endY)) {
                if (startX > endX) {
                    result = "left";
                } else {
                    result = "right";
                }
            } else {
                if (startY > endY) {
                    result = "top";
                } else {
                    result = "bottom";
                }
            }
            return result;
        }

        function fireEvent(type, e) {
            var coords = extractCoord(e),
                customEvent = document.createEvent('Event');

            customEvent.initEvent(type, true, true);
            customEvent[type] = {
                clientX: coords.clientX,
                clientY: coords.clientY,
                screenX: coords.screenX,
                screenY: coords.screenY,
                timeStamp: e.timeStamp
            };
            e.target.dispatchEvent(customEvent);
        }

        function getDirectionVelosity(lastX, lastY, lastTime, endX, endY, endTime) {
            var distance,
                velocity,
                direction = getDirection(lastX, lastY, endX, endY);

            switch (direction) {
            case "left":
                distance = lastX - endX;
                break;
            case "right":
                distance = endX - lastX;
                break;
            case "top":
                distance = lastY - endY;
                break;
            case "bottom":
                distance = endY - lastY;
                break;
            }
            velocity = (distance / (endTime - lastTime)).toFixed(3);
            return velocity;
        }

        function distance(x1, y1, x2, y2) {
            var xdiff = x2 - x1,
                ydiff = y2 - y1;
            return Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);
        }

        function saveLastPoint(e) {
            var coords = extractCoord(e);
            lastMove = preLastMove;
            preLastMove = {
                screenX: coords.screenX,
                screenY: coords.screenY,
                timeStamp: e.timeStamp
            };
        }

        swiper.down = function (e) {
            var coords = extractCoord(e);
            swiper.startX = coords.screenX;
            swiper.startY = coords.screenY;
            swiper.startClientX = coords.clientX;
            swiper.startClientY = coords.clientY;
            swiper.timeStamp = e.timeStamp;
            swiper.moved = false;
            swiper.isDown = true;
            swiper.touchStartTime = new Date().getTime();

            lastMove = preLastMove = {
                screenX: 0,
                screenY: 0,
                timeStamp: new Date().getTime()
            };
            saveLastPoint(e);
            fireEvent("tapdown", e);
        };

        swiper.move = function (e) {
            var coords = extractCoord(e);
            if (swiper.isDown) {
                fireEvent("tapmove", e);
            }
            if (Math.abs(coords.screenX - swiper.startX) > TOUCH_DIFFERENCE || (Math.abs(coords.screenY - swiper.startY) > TOUCH_DIFFERENCE)) {
                swiper.moved = true;
                saveLastPoint(e);
            }
        };

        swiper.cancel = function (e) {
            if (swiper.isDown) {
                if (swiper.touch) {
                    swiper.up(e);
                } else {
                    fireEvent("tapcancel", e);
                }
            }
        };

        swiper.clear = function (e) {
            fireEvent("tapclear", e);
        };

        swiper.up = function (e) {
            var swipeEvent,
                coord = extractCoord(e),
                dVelocity,
                velocity,
                duration = new Date().getTime() - swiper.touchStartTime;

            if (!swiper.isDown) {
                return;
            }

            swiper.isDown = false;
            if (!swiper.moved && duration <= 400) {
                fireEvent("tap", e);
            }

            velocity = (distance(lastMove.screenX, lastMove.screenY, coord.screenX, coord.screenY) / (e.timeStamp - lastMove.timeStamp)).toFixed(3);
            if (swiper.moved && velocity > 0) {

                dVelocity = getDirectionVelosity(lastMove.screenX, lastMove.screenY, lastMove.timeStamp, coord.screenX, coord.screenY, e.timeStamp);

                swipeEvent = document.createEvent('Event');
                swipeEvent.initEvent('swipe', true, true);
                swipeEvent.swipe = {
                    //start point event attributes
                    start: {
                        screenX: swiper.startX,
                        screenY: swiper.startY,
                        clientX: swiper.startClientX,
                        clientY: swiper.startClientY,
                        timeStamp: swiper.timeStamp
                    },
                    //end point event attributes
                    end: {
                        screenX: coord.screenX,
                        screenY: coord.screenY,
                        clientX: coord.clientX,
                        clientY: coord.clientY,
                        timeStamp: e.timeStamp
                    },
                    //velocity(px/ms) in end point without direction
                    velocity: velocity,
                    //swipe direction ("left", "right", "top", "bottom")
                    direction: getDirection(swiper.startX, swiper.startY, coord.screenX, coord.screenY),
                    //swipe speed(px/ms) in end point by direction
                    speed: dVelocity
                };
                e.target.dispatchEvent(swipeEvent);
            }

            fireEvent("tapup", e);
        };

        swiper.destroy = function () {
            if (!this.touch) {
                this.el.removeEventListener('mousedown', this.down);
                this.el.removeEventListener('mouseup', this.up);
                this.el.removeEventListener('mousemove', this.move);
                this.el.removeEventListener('mouseout', this.cancel);
                this.el.removeEventListener('mouseover', this.clear);
            } else {
                this.el.removeEventListener('touchstart', this.down);
                this.el.removeEventListener('touchend', this.up);
                this.el.removeEventListener('touchmove', this.move);
                this.el.removeEventListener('touchcancel', this.cancel);
            }
            delete this.el;
        };

        // init
        swiper.el = element;
        element = null;
        swiper.touch = (window.ontouchstart !== undefined);
        if (!swiper.touch) {
            swiper.el.addEventListener('mousedown', swiper.down, false);
            swiper.el.addEventListener('mouseup', swiper.up, false);
            swiper.el.addEventListener('mousemove', swiper.move, false);
            swiper.el.addEventListener('mouseout', swiper.cancel, false);
            swiper.el.addEventListener('mouseover', swiper.clear, false);
        } else {
            swiper.el.addEventListener('touchstart', swiper.down, false);
            swiper.el.addEventListener('touchend', swiper.up, false);
            swiper.el.addEventListener('touchmove', swiper.move, false);
            swiper.el.addEventListener('touchcancel', swiper.cancel, false);
        }

        return swiper;
    }

    //  constructor
    self.swipe = new Swiper(core.document.body);

    return self;
});