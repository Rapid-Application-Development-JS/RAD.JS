RAD.namespace("RAD.Blanks.SwipeView", RAD.Blanks.View.extend({
    url: 'source/views/parent_widget/swipe_view.html',

    innerIndex: 0,
    isSwiping: false,
    swipeRunning: false,

    swipe: function (e) {
        var direction = e.direction;
        if ((direction === "left" || direction === "right") && e.speed > 0.25 && !this.swipeRunning) {
            this.swipeTo(direction);
        }
    },

    oninit: function () {
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
                    self.containerWidth =  self.$container.outerWidth();
                }, 300);
            });
        });
    },

    handleEvent: function (e) {
        switch (e.type) {
            case 'fling':
                this.swipe(e);
                break;
            case 'pointerdown':
                this.tapDown(e);
                break;
            case 'pointermove':
                e.origin.preventDefault();
                this.tapMove(e);
                break;
            case 'pointerup':
                this.tapUp(e);
                break;
        }
        e.release();
    },

    onrender: function () {
        if (this.gestureAdapter) {
            this.gestureAdapter.destroy();
        }
        this.gestureAdapter = new GestureAdapter(this.$('.swipe-container')[0], this);
    },

    ondestroy: function () {
        if (this.gestureAdapter) {
            this.gestureAdapter.destroy();
        }
        $(window).off('resize.module');
    },

    setContent: function (arrayIndex, dataIndex) {
        var container = this.containers[arrayIndex].containerID,
            viewID = this.swipe_content[dataIndex],
            options = {
                animation: "none",
                content: viewID,
                container_id: container
            };
        this.publish('navigation.show', options);
    },

    clearState: function () {
        var i, pages_count = this.getPageCount(), $container;

        this.innerIndex = 0;
        this.isSwiping = false;
        this.swipeRunning = false;

        this.$container = this.$(".swipe-container");
        this.containerWidth = this.$container.outerWidth();
        this.changeContainerPosition(0);

        //cache jquery container link
        this.containers = [
            {$container: this.$(".swipe-0"), containerID: ".swipe-0"},
            {$container: this.$(".swipe-1"), containerID: ".swipe-1"},
            {$container: this.$(".swipe-2"), containerID: ".swipe-2"}
        ];

        for (i = 0; i < 3; i += 1) {
            $container = this.containers[i].$container;
            this.publish($container.attr('view') + '.detach');
            $container.removeAttr('view');
            $container.children().detach();
        }
        this.children.length = 0;

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
        this.containers[containerID].$container.css({
            'left': position  * 100 + '%'
        });
    },

    getPageCount: function () {
        return this.swipe_content.length;
    },

    changeContainerPosition: function (position) {
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
        if (this.swipeRunning || this.inAnimation) {
            return;
        }
        this.isSwiping = false;

        this.startX = e.clientX;
    },

    tapMove: function (e) {
        if (this.swipeRunning) {
            return;
        }
        this.isSwiping = true;
        var X = e.clientX,
            delta = X - this.startX;

        //calculate new containers positions
        this.changeContainerPosition(this.containerPosition + delta);

        //for next move function
        this.startX = X;
    },

    tapUp: function () {
        var position, containerWidth = this.containerWidth,
            delta = 0, direction = "right", pages_count = this.getPageCount();

        if (!this.isSwiping || this.swipeRunning) {
            return;
        }

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
        var position, containerWidth = this.containerWidth,
            delta = 0, pages_count = this.getPageCount();

        if (!(direction === "left" || direction === "right")) {
            return;
        }

        if (!this.isSwiping) {
            return;
        }

        this.swipeRunning = true;

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

    // callbacks if you needed
    onLoadPage: function (index, element) {
        //when page loading
    },

    onUnloadPage: function (index, element) {
        //when page start unload
    },

    onSwipeStart: function () {
        //when pages start scrolling
    },

    onSwipeEnd: function (html, index, lastHtml) {
        //when central page stop animation
    }
}));

RAD.view("view.parent_widget", RAD.Blanks.SwipeView.extend({
    swipe_content: ["view.inner_first_widget", "view.inner_second_widget", "view.inner_third_widget"],
    onEndRender: function () {
        this.clearState();
    }
}));