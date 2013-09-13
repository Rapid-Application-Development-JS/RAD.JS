RAD.view('view.filter', RAD.Blanks.ScrollableView.extend({
    url: 'source/views/inner/filter/filter.html',
    model: RAD.models.categories,
    events: {
        'tap ul.status-criteria > li.status': 'onCriteriaChk',
        'tap ul.category-criteria > li.category': 'onCriteriaChk',
        'tap .btn-filter': 'doFilter',
        'tap .btn-filter-clear': 'clearFilter',
        "tap .btn-start-test": "prepareCards",
        'tap .list-header': "spinner"
    },
    onInitialize: function () {
        this.filterResult = [];
        this.countCards();
    },
    onEndRender: function () {
        this.$statuses = this.$('ul.status-criteria > li.status');
        this.$categories = this.$('ul.category-criteria > li.category');
        this.$startBtn = this.$('.btn-start-test').get(0);
    },
    onStartAttach: function () {
        this.countCards();
        this.render();
    },

    countCards: function () {
        var model = this.model;
        model.know=0;
        model.unsure=0;
        model.dontknow=0;
        model.unanswered=0;
        RAD.models.cards.each( function (card) {
            switch(card.get('status')) {
                case 'know': model.know+=1; break;
                case 'unsure': model.unsure+=1; break;
                case 'dontknow': model.dontknow+=1; break;
                case 'unanswered': model.unanswered+=1; break;
            }
        });
    },
    onEndDetach: function () {
        this.clearFilter();
    },
    onCriteriaChk: function (e) {
        e.stopPropagation();
        $(e.currentTarget).toggleClass('checked');
    },
    doFilter: function () {
        var self = this,
            startBtn = this.$startBtn,
            cardsByCat = RAD.models.cards.cardsByCat,
            cards = RAD.models.cards,
            statusFilter = [],
            catFilter = [],
            result = [];

        self.$statuses.each(function (i, el) {
            if ($(el).hasClass('checked')) {
                statusFilter.push($(el).data('value'));
            }
        });

        self.$categories.each(function (i, el) {
            if ($(el).hasClass('checked')) {
                catFilter.push(parseInt($(el).data('id')));
            }
        });

        if (catFilter.length === 0 && statusFilter.length === 0) {
            //alert display
        } else if (catFilter.length !== 0) {
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
            })
        }

        this.filterResult = result;

        startBtn.disabled = !(this.filterResult.length > 0);

        //TODO: toast message with filter results, not dialog
        var msg = result.length + ' card' + (result.length == 1 ? '': 's') + ' found',
            options = {
            content: 'view.info_dialog',
            extras: {
                msg: msg
            }
        };
        this.publish('navigation.dialog.show', options);
    },
    clearFilter: function () {
        this.$startBtn.disabled = true;
        this.$statuses.removeClass('checked');
        this.$categories.removeClass('checked');
        this.filterResult = [];
    },
    onReceiveMsg: function (channel, data) {
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
    spinner: function (e) {
        var self = this,
            $listItems = $(e.currentTarget.parentElement).children(".list-item"),
            $spinnerIn = $(e.currentTarget).children(".spinner-in"),
            $spinnerOut = $(e.currentTarget).children(".spinner-out");
        if ($listItems.first().css('height') == '52px') {
            $listItems.each(function() {
                var listItem = this;
                $(listItem).animate({ height: '0px', paddingBottom: '0px', paddingTop: '0px' }, {
                    duration: 500,
                    queue: false,
                    always: function() {
                        self.refreshScroll();
                    }
                });
                $spinnerIn.hide();
                $spinnerOut.show();
            });
        }
        else if ($listItems.first().css('height') == '0px') {
            $listItems.each(function() {
                var listItem = this;
                $(listItem).animate({ height: '52px', paddingBottom: '17px', paddingTop: '15px' }, {
                    duration: 500,
                    queue: false,
                    always: function() {
                        self.refreshScroll();
                    }
                });
                $spinnerIn.show();
                $spinnerOut.hide();
            });

        }
    }
}));