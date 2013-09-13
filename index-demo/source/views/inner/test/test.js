RAD.namespace("RAD.views.SwipeAdapterView", RAD.Blanks.View.extend({
    events: {
        'swipe .swipe-container': 'swipe',
        'tapdown .swipe-container': 'tapDown',
        'tapmove .swipe-container': 'tapMove',
        'tapup .swipe-container': 'tapUp',
        'tapcancel .swipe-container': 'tapChancel',
        'tapclear .swipe-container': 'tapClear'
    },

    innerIndex: 0,
    isMoving: false,
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
        this.isMoving = false;
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
        this.isMoving = false;
        this.isDown = true;

        this.startX = e.originalEvent.tapdown.clientX;
    },

    tapMove: function (e) {
        "use strict";
        if (this.swipeRunning || !this.isDown) {
            return;
        }
        var X = e.originalEvent.tapmove.clientX,
            delta = X - this.startX;

        if(!this.isMoving && Math.abs(delta) < 10) return;
        this.isMoving = true;

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

        if (!this.isMoving || this.swipeRunning || !this.isDown) {
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

        if (delta === 0) { // no swiping bug hotfix
            return;
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

        if (!this.isMoving || !this.isDown) {
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
            elements = $html.find('.scroll-view');
        elements.each(function (i, el) {
            $html.get(0)['mScroll' + i] = new window.iScroll(el, {
                bounce: false,
                momentum: false,
                hideScrollbar: true,
                fadeScrollbar: true,
                scrollbarClass: 'testScroll',
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
                    if (this.dirY !== 0 && !self.isMoving) {
                        self.swipeRunning = true;
                    }
                },
                onScrollEnd: function () {
                    self.swipeRunning = false;
                }
            });
        });
    },
    refreshPageScroll: function ($html) {
        var el = $html.get(0);
        if (el && el.mScroll0) {
            el.mScroll0.refresh();
        }
        if (el && el.mScroll1) {
            el.mScroll1.refresh();
        }
    },
    destroyScroll: function ($html) {
        "use strict";
        var el = $html.get(0);
        if (el && el.mScroll0) {
            el.mScroll0.destroy();
            el.mScroll0 = null;
        }
        if (el && el.mScroll1) {
            el.mScroll1.destroy();
            el.mScroll1 = null;
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

RAD.view("view.test", RAD.views.SwipeAdapterView.extend({
    url: 'source/views/inner/test/test_swipe_view.html',
    pageUrl: 'source/views/inner/test/test_swipe_page.html',

    model: RAD.models.test,

    getPageCount: function () {
        "use strict";
        return this.model.length;
    },

    onInitialize: function () {
        this.subscribe('buttons.done', this.onDone, this);
    },

    onNewExtras: function (data) {
        var self = this;
        if (!!data.cards) {
            self.model.reset(data.cards);
        }
    },

    onEndRender: function () {
        "use strict";
    },

    onStartAttach: function () {
        var self = this;

        if (!self.application.flags.get('testRunning')) {
            self.clearState();
        }
        self.$el.find('.variants-holder').on('tap.variant', '.variant', function (e) {
            self.answer(e);
        });
    },
    onEndDetach: function () {
        this.$el.find('.variants-holder').off('tap.variant', '.variant');
    },
    getData: function (position) {
        "use strict";
        return this.model.at(position);
    },

    onLoadPage: function (index, element) {
        "use strict";
        //when page loading
        var self = this,
            modelLength = this.model.length;
        if (index == 0) {
            $(element).find('.icon-left').addClass('hidden');
        }
        if (index == ( modelLength - 1 ) || modelLength == 1) {
            $(element).find('.icon-right').addClass('hidden');
        }
        $(element).find('.question-holder').on('tap.btn_' + index, function (e) {
            e.stopPropagation();
            $(element).find('.answer-holder').addClass('show');
            $(element).find('.question-holder').removeClass('show');
        });
        $(element).find('.answer-holder').on('tap.btn_' + index, function (e) {
            e.stopPropagation();
            $(element).find('.question-holder').addClass('show');
            $(element).find('.answer-holder').removeClass('show');
        });
        $(element).find('.btn-show-image').on('tap.btn_' + index, function (e) {
            e.stopPropagation();
            self.displayFullImage(e);
        });
    },
    onUnloadPage: function (index, element) {
        $(element).find('.question-holder').off('tap.btn_' + index);
        $(element).find('.answer-holder').off('tap.btn_' + index);
        $(element).find('.btn-show-image').off('tap.btn_' + index);
    },
    onSwipeEnd: function (html, index, lastHtml) {
        "use strict";
        //when central page stop animation
        this.refreshPageScroll($(html));
        this.model.cardIndex = index;
        this.model.cardStatus = this.model.at(index).get('status');
        this.model.trigger('change');
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
        case 'confirm':
            self.finishTest();
            break;
        }
    },

    answer: function (e) {
        e.stopPropagation();
        var target = $(e.currentTarget),
            i = this.model.cardIndex;
        this.model.at(i).set('status', target.data('status'), {silent: true});
        target.addClass('active');
        target.siblings('div').removeClass('active');
    },

    displayFullImage: function (e) {
        var target = $(e.currentTarget),
            imgSource = target.data('src'),
            options = {
                content: 'view.image_view',
                target: '#screen',
                extras: {
                    src: imgSource
                }
            };
        this.publish('navigation.dialog.show', options);
    },

    onDone: function () {
        var options = {
                content: 'view.confirm_dialog',
                extras: {
                    msg: 'Do you want to complete the test? Your progress will be saved.',
                    fromViewID: this.viewID
                }
            };
        this.publish('navigation.dialog.show', options);
    },

    finishTest: function () {
        var self = this;

        self.model.each(function (card) {
            RAD.models.cards.get(card.id).set('status', card.get('status'));
        });
        RAD.models.cards.groupCardsByCats();
        self.application.saveProgress();

        self.application.flags.set('testRunning', false);
        self.publish('view.main_screen.doneBtnHide');
        self.publish('navigation.show', {
            content: 'view.stats',
            container_id: '.sub-content',
            extras: {}
        });
        self.publish('view.main_screen.changeTitle', {title: 'statistics'});
    }
}));