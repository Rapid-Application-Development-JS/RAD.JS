RAD.namespace("RAD.views.SwipeAdapterView", RAD.Blanks.View.extend({
    url: 'source/views/inner/first_widget/swipe_view.html',
    events: {
        'swipe .swipe-container': 'swipe',
        'tapdown .swipe-container': 'tapDown',
        'tapmove .swipe-container': 'tapMove',
        'tapup .swipe-container': 'tapUp',
        'tapcancel .swipe-container': 'tapChancel',
        'tapclear .swipe-container': 'tapClear'
    },

    innerIndex: 0,
    isSwiping: false,
    swipeRunning: false,

    swipe: function (e) {
        "use strict";
        var direction = e.originalEvent.swipe.direction;
        if ((direction === "left" || direction === "right") && e.originalEvent.swipe.speed > 0.25 && !this.swipeRunning) {
            this.swipeTo(direction);
        }
    },

    oninit: function () {
        "use strict";
        var self = this;

        self.pageLoader = new RAD.Blanks.Deferred();

        $.get(self.pageUrl, function (data) {
            self.pageTemplate = _.template(data);
            self.pageLoader.resolve();
        }, 'text');

        self.loader.done(function () {
            $(window).on('resize.module', function () {
                setTimeout(function () {
                    var containerWidthRatio = self.$container.outerWidth() / self.containerWidth;
                    self.changeContainerPosition(self.containerPosition * containerWidthRatio);
                    self.containerWidth = self.$container.outerWidth();
                }, 300);
            });
        });
    },

    ondestroy: function () {
        "use strict";
        $(window).off('resize.module');
    },

    setContent: function (arrayIndex, dataIndex) {
        "use strict";
        var self = this,
            container = this.containers[arrayIndex].$container,
            oldDataIndex = this.containers[arrayIndex].dataIndex;

        self.pageLoader.done(function () {
            //unload content
            if (oldDataIndex !== undefined) {
                self.onUnloadPage(oldDataIndex, container.get(0));
            }
            self.destroyScroll(container);

            //setup content
            container.html(self.pageTemplate({index: dataIndex, data: self.getData(dataIndex)}));
            self.containers[arrayIndex].dataIndex = dataIndex;
            self.createScroll(container);
            self.onLoadPage(dataIndex, container.get(0));
        });
    },
    clearState: function () {
        "use strict";
        var i, pages_count = this.getPageCount();

        this.innerIndex = 0;
        this.isSwiping = false;
        this.swipeRunning = false;

        this.$container = this.$(".swipe-container");
        this.containerWidth = this.$container.outerWidth();
        this.changeContainerPosition(0);

        //cache jquery container link
        this.containers = [
            {$container: this.$(".swipe-0")},
            {$container: this.$(".swipe-1")},
            {$container: this.$(".swipe-2")}
        ];

        for (i = 0; i < 3; i += 1) {
            this.containers[i].$container.html("");
        }

        for (i = 0; i < pages_count && i < 3; i += 1) {
            this.setContent(i, i);
        }

        //serup position value
        this.changePosition(0, 0);
        this.changePosition(1, 1);
        this.changePosition(2, 2);

        this.onSwipeEnd(this.containers[0].$container.get(0), 0, null);
    },

    changePosition: function (containerID, position) {
        "use strict";
        this.containers[containerID].$container.css({
            'left': position * 100 + '%'
        });
    },

    changeContainerPosition: function (position) {
        "use strict";
        var value = "translate3d(" + position + "px, 0, 0)";
        this.$container.css({
            'transform': value,
            '-o-transform': value,
            '-ms-transform': value,
            '-moz-transform': value,
            '-webkit-transform': value
        });
        this.containerPosition = position;
    },

    tapDown: function (e) {
        "use strict";
        if (this.swipeRunning || this.inAnimation) {
            return;
        }
        this.isSwiping = false;
        this.isDown = true;

        this.startX = e.originalEvent.tapdown.clientX;
    },

    tapMove: function (e) {
        "use strict";
        if (this.swipeRunning || !this.isDown) {
            return;
        }
        this.isSwiping = true;
        var X = e.originalEvent.tapmove.clientX,
            delta = X - this.startX;

        //calculate new containers positions
        this.changeContainerPosition(this.containerPosition + delta);

        //for next move function
        this.startX = X;
    },

    tapChancel: function (e) {
        "use strict";
        var self = this;
        this.clearTimeout = setTimeout(function () {
            self.tapUp();
        }, 50);
    },

    tapClear: function (e) {
        "use strict";
        clearTimeout(this.clearTimeout);
    },

    tapUp: function () {
        "use strict";
        var position, containerWidth = this.containerWidth,
            delta = 0, direction = "right", pages_count = this.getPageCount();

        if (!this.isSwiping || this.swipeRunning || !this.isDown) {
            return;
        }

        this.isDown = false;
        this.swipeRunning = true;

        //calculate delta shift
        position = Math.abs(this.containerPosition % containerWidth);
        if (position < containerWidth / 2) {
            delta = position;
        } else {
            delta = position - containerWidth;
            direction = "left";
        }

        //check left && right limits
        if (this.containerPosition > 0) {
            direction = "right";
            delta = -this.containerPosition;
        } else if ((-parseInt(this.containerPosition / containerWidth, 10) === (pages_count - 1))) {
            direction = "left";
            delta = position;
        }
        this.prepareAnimation(direction);
        this.onSwipeStart();
        this.changeContainerPosition(this.containerPosition + delta);
    },

    prepareAnimation: function (direction) {
        "use strict";
        var self = this,
            $container = this.$container,
            eventName = 'webkitTransitionEnd oTransitionEnd transitionend msTransitionEnd';

        if ($container.get(0).timeout) {
            return;
        }

        function onEnd() {
            $container.removeClass('swipe-animation');
            $container.off(eventName, onEnd);
            clearTimeout($container.get(0).timeout);
            self.tweetPosition(direction);
            self.swipeRunning = false;
            self.inAnimation = false;

            $container.get(0).timeout = null;
        }
        self.inAnimation = true;

        $container.addClass('swipe-animation');
        $container.one(eventName, onEnd);
        $container.get(0).timeout = setTimeout(onEnd, 5000);
    },

    tweetPosition: function (direction) {
        "use strict";
        var i,
            tmp,
            containerWidth = this.containerWidth,
            current_position = -parseInt(this.containerPosition / containerWidth, 10),
            pages_count = this.getPageCount(),
            lastHtml = this.containers[this.innerIndex].$container.get(0),
            currentVisibleInnerIndex = 0,
            hasChanged = false;
        for (i = 0; i < pages_count && i < 3; i += 1) {
            if (this.containers[i].$container.offset().left === 0) {
                currentVisibleInnerIndex = i;
                break;
            }
        }

        if (currentVisibleInnerIndex === 2 && direction === 'left' && (current_position < pages_count - 1)) {
            tmp = this.containers.shift();
            this.containers.push(tmp);

            this.changePosition(2, current_position + 1);
            this.setContent(2, current_position + 1);

            currentVisibleInnerIndex -= 1;
            hasChanged = true;
        } else if (currentVisibleInnerIndex === 0 && direction === 'right' && current_position > 0) {
            tmp = this.containers.pop();
            this.containers.unshift(tmp);

            this.changePosition(0, current_position - 1);
            this.setContent(0, current_position - 1);

            currentVisibleInnerIndex += 1;
            hasChanged = true;
        }

        if (this.innerIndex !== currentVisibleInnerIndex || hasChanged) {
            this.innerIndex = currentVisibleInnerIndex;
            this.onSwipeEnd(this.containers[currentVisibleInnerIndex].$container.get(0), current_position, lastHtml);
        }
    },

    swipeTo: function (direction) {
        "use strict";
        var position, containerWidth = this.containerWidth,
            delta = 0, pages_count = this.getPageCount();

        if (!(direction === "left" || direction === "right")) {
            return;
        }

        if (!this.isSwiping || !this.isDown) {
            return;
        }

        this.swipeRunning = true;
        this.isDown = false;

        //calculate delta shift
        position = Math.abs(this.containerPosition % containerWidth);
        if (direction === "right") {
            delta = position;
        } else {
            delta = position - containerWidth;
        }

        //check left && right limits
        if (this.containerPosition > 0) {
            direction = "left";
            delta = -this.containerPosition;
        } else if ((-parseInt(this.containerPosition / containerWidth, 10) === (pages_count - 1))) {
            direction = "right";
            delta = position;
        }

        this.prepareAnimation(direction);
        this.onSwipeStart();
        this.changeContainerPosition(this.containerPosition + delta);

    },

    createScroll: function ($html) {
        "use strict";
        var self = this,
            element = $html.find('.scroll-view').get(0);

        $html.get(0).mScroll = new window.iScroll(element, {
            onBeforeScrollStart: function (e) {
                var target = e.target;

                while (target.nodeType !== 1) {
                    target = target.parentNode;
                }
                if (target.tagName !== 'SELECT' && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                }
            },
            onScrollStart: function (e) {
                if (self.swipeRunning) {
                    e.preventDefault();
                    e.stopPropagation();
                    self.swipeRunning = false;
                }
            },
            onScrollMove: function () {
                if (this.dirY !== 0 && !self.isSwiping) {
                    self.swipeRunning = true;
                }
            },
            onScrollEnd: function () {
                self.swipeRunning = false;
            }
        });
    },

    destroyScroll: function ($html) {
        "use strict";
        var el = $html.get(0);
        if (el && el.mScroll) {
            el.mScroll.destroy();
            el.mScroll = null;
        }
    },

// callbacks if you needed
    onLoadPage: function (index, element) {
        "use strict";
        //when page loading
    },

    onUnloadPage: function (index, element) {
        "use strict";
        //when page start unload
    },

    onSwipeStart: function () {
        "use strict";
        //when pages start scrolling
    },

    onSwipeEnd: function (html, index, lastHtml) {
        "use strict";
        //when central page stop animation
    }
}));


// example
RAD.model("RAD.models.MyCollection", (function () {
    "use strict";

    var Models = Backbone.Collection.extend({}),
        i,
        j,
        PAGE_TIME = 10,
        PAGES = 100,
        p,
        o = [],
        alphabet = [
            'a', 'b', 'c', 'd', 'e', 'f',
            'g', 'h', 'i', 'j', 'k', 'l',
            'm', 'n', 'o', 'p', 'q', 'r',
            's', 't', 'u', 'v', 'w', 'x',
            'y', 'z'
        ],
        CHANNELS = alphabet.length * 3;


    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function getRandomArray() {
        var result = [], sum = 0, num, i;
        for (i = 0; i < 5; i += 1) {
            num = getRandomInt(1, 100);

            if ((sum + num) > 100) {
                result.push(100 - sum);
                break;
            }
            result.push(num);
            sum += num;
        }
        return result;
    }


    // create data for stub
    for (i = 0; i < PAGES; i += 1) {
        p = {
            startTime: i * PAGE_TIME,
            endTime: (i + 1) * PAGE_TIME,
            channels: []
        };

        for (j = 0; j < CHANNELS; j += 1) {
            p.channels.push({name: alphabet[j / 3], data: getRandomArray()});
        }

        o.push(p);
    }

    return new Models(o);
}()));

RAD.view("view.inner_first_widget", RAD.views.SwipeAdapterView.extend({
    pageUrl: 'source/views/inner/first_widget/swipe_page.html',

    getPageCount: function () {
        "use strict";
        return RAD.models.MyCollection.length;
    },

    onEndRender: function () {
        "use strict";
        this.clearState();
    },

    getData: function (position) {
        "use strict";
        var model = RAD.models.MyCollection.at(position);
        return model;
    },

    onReceiveMsg: function (channel, data) {
        "use strict";
        var self = this,
            parts = channel.split('.');

        switch (parts[2]) {
        case 'block':
            self.swipeRunning = true;
            break;
        case 'unblock':
            self.swipeRunning = false;
            break;
        }
    }
}));