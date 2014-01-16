RAD.view('view.filter', RAD.Blanks.ScrollableView.extend({
    url: 'source/views/inner/filter/filter.html',
    model: RAD.models.categories,
    events: {
        'tap div.status-criteria > ul.list > li.status': 'onCriteriaChk',
        'tap div.category-criteria > ul.list > li.category': 'onCriteriaChk',
        'tap .btn-filter': 'doFilter',
        'tap .btn-filter-clear': 'clearFilter',
        "tap .btn-start-test": "prepareCards",
        'tap .list-header': "toggleVisible"
    },
    onInitialize: function () {
        "use strict";
        this.filterResult = [];
        this.countCards();
    },
    onEndRender: function () {
        "use strict";
        this.$statuses = this.$('div.status-criteria > ul.list > li.status');
        this.$categories = this.$('div.category-criteria > ul.list > li.category');
        this.$startBtn = this.$('.btn-start-test');
        this.$filterBtn = this.$('.btn-filter');
    },
    onEndAttach: function () {
        "use strict";
        this.countCards();
        this.render();
    },

    countCards: function () {
        "use strict";
        var model = this.model;
        model.know = 0;
        model.unsure = 0;
        model.dontknow = 0;
        model.unanswered = 0;
        RAD.models.cards.each(function (card) {
            switch (card.get('status')) {
            case 'know':
                model.know += 1;
                break;
            case 'unsure':
                model.unsure += 1;
                break;
            case 'dontknow':
                model.dontknow += 1;
                break;
            case 'unanswered':
                model.unanswered += 1;
                break;
            }
        });
    },
    onEndDetach: function () {
        "use strict";
        this.clearFilter();
    },
    onCriteriaChk: function (e) {
        "use strict";
        e.stopPropagation();
        $(e.currentTarget).toggleClass('checked');
    },
    doFilter: function () {
        "use strict";
        var self = this,
            cardsByCat = RAD.models.cards.cardsByCat,
            cards = RAD.models.cards,
            statusFilter = [],
            catFilter = [],
            result = [],
            options = {
                content: 'view.info_dialog',
                extras: {
                    msg: ''
                }
            };

        self.$statuses.each(function (i, el) {
            if ($(el).hasClass('checked')) {
                statusFilter.push($(el).data('value'));
            }
        });

        self.$categories.each(function (i, el) {
            if ($(el).hasClass('checked')) {
                catFilter.push(parseInt($(el).data('id'), 10));
            }
        });

        if (catFilter.length !== 0) {
            if (statusFilter.length === 0) {
                _.each(catFilter, function (catID) {
                    _(cardsByCat[catID]).each(function (card) {
                        result.push(card.toJSON());
                    });
                });
            } else {
                _.each(catFilter, function (catID) {
                    _.each(statusFilter, function (status) {
                        _.each(cardsByCat[catID], function (card) {
                            if (card.get('status') === status) {
                                result.push(card.toJSON());
                            }
                        });
                    });
                });
            }
        } else {
            _.each(statusFilter, function (status) {
                cards.each(function (card) {
                    if (card.get('status') === status) {
                        result.push(card.toJSON());
                    }
                });
            });
        }

        this.filterResult = result;

        if (this.filterResult.length > 0) {
            this.$startBtn.get(0).disabled = false;
            this.$startBtn.addClass('topcoat-button--cta');
            this.$filterBtn.removeClass('topcoat-button--cta');
        }
        options.extras.msg = result.length + ' card' + (result.length === 1 ? '' : 's') + ' found';
        this.publish('navigation.dialog.show', options);
    },
    clearFilter: function () {
        "use strict";
        this.$startBtn.get(0).disabled = true;
        this.$startBtn.removeClass('topcoat-button--cta');
        this.$filterBtn.addClass('topcoat-button--cta');
        this.$statuses.removeClass('checked');
        this.$categories.removeClass('checked');
        this.filterResult = [];
    },
    onReceiveMsg: function (channel, data) {
        "use strict";
        var self = this,
            parts = channel.split('.');

        switch (parts[2]) {
        case 'confirm':
            self.publish('view.main_screen.doneBtnHide');
            self.application.flags.set('testRunning', false);
            self.prepareCards();
            break;
        }
    },
    prepareCards: function (e) {
        "use strict";
        var self = this,
            testCards = _.clone(self.filterResult),
            options;

        if (self.$startBtn.disabled) {
            return false;
        }

        if (testCards.length === 0) {
            //display alert toast
            this.publish('navigation.toast.show', {content: 'view.alert', extras: {msg: 'There is no maps to display by filter'}});
            return false;
        } else if (this.application.flags.get('testRunning')) {
            this.publish('navigation.dialog.show', {
                content: 'view.confirm_dialog',
                extras: {
                    msg: 'Test already started. Start new test anyway? Your answers will not be saved.',
                    fromViewID: this.viewID
                }
            });
            return false;
        } else {
            options = {
                content: 'view.test',
                container_id: '.sub-content',
                animation: 'slide-in',
                extras: {
                    cards: testCards
                },
                callback: function () {
                    self.application.flags.set('testRunning', true);
                    self.application.saveProgress();
                    self.publish('view.main_screen.doneBtnShow');
                }
            };

            self.publish('navigation.show', options);
            self.publish('view.main_screen.changeTitle', {title: 'Testing'});
        }
    },
    toggleVisible: function (e) {
        "use strict";
        var self = this,
            targetID = $(e.currentTarget).data('target'),
            $spinner = $(e.currentTarget).find('.spinner'),
            $target = this.$('.' + targetID),
            height = $target.find('ul').outerHeight(true),
            params;

        if (!this[targetID]) {
            this[targetID] = false;
            params = {
                'height': height
            };
        } else {
            params = {
                'height': 0
            };
        }

        $spinner.each(function () {
            $(this).toggle();
        });

        this[targetID] = !this[targetID];
        $target.css(params);

        setTimeout(function () {
            self.refreshScroll();
        }, 550);
    }
}));