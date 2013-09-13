RAD.view("view.cards", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/inner/cards/cards.html',

    events: {
        "tap li.category": "onCatCheck",
        "tap .btn-start-test": "prepareCards",
        "tap .btn-filter-clear": "resetChecks"
    },

    onInitialize: function () {
        this.model = RAD.models.categories;
        this.chkCatIDs = [];
        this.chkCardsCount = 0;
        this.lengthLog = 0;

    },

    onEndRender: function () {
        this.$cats = this.$('li.category');
        this.$counters = this.$('div.counter span');
        this.$footer = this.$('div.footer-bar');
        this.$pageContent = this.$('div.page-content');
    },

    onCatCheck: function (e) {
        e.stopPropagation();

        var self = this,
            target = $(e.currentTarget),

            catIDs = [], i;

        self.chkCatIDs = [];
        self.chkCardsCount = 0;

        target.toggleClass('checked');

        this.$cats.each(function(i, el) {
            if ($(el).hasClass('checked')) {
                catIDs.push(parseInt($(el).data('id')));
            }
        });

        self.chkCatIDs = catIDs;

        for (i = 0; i < catIDs.length; i++) {
            self.chkCardsCount += RAD.models.cards.cardsByCat[catIDs[i]].length;
        }

        this.$counters[0].innerHTML = self.chkCatIDs.length + ' Categor' + (self.chkCatIDs.length !== 1 ? 'ies' : 'y');
        this.$counters[1].innerHTML = self.chkCardsCount + ' Card' + (self.chkCardsCount !== 1 ? 's' : '');


        if (self.chkCatIDs.length == 0) {
            this.$footer.animate({ bottom: '-80px' }, {
                duration: 500,
                queue: false
            });
            this.$pageContent.animate({ bottom: '0px' }, {
                duration: 500,
                queue: false,
                always: function() {
                    self.refreshScroll();
                }
            });
        }
        else if (self.chkCatIDs.length == 1 && self.lengthLog == 0) {
            this.$footer.animate({ bottom: '0px' }, {
                duration: 500,
                queue: false
            });
            this.$pageContent.animate({ bottom: '80px' }, {
                duration: 500,
                queue: false,
                always: function() {
                    self.refreshScroll();
                    if (self.mScroll.wrapperH - e.originalEvent.tap.clientY <= -44) {
                        self.mScroll.scrollTo(0, self.mScroll.y-80, 500);
                    }
                }
            });
        }
        self.lengthLog = self.chkCatIDs.length;
    },

    resetChecks: function() {
        var self = this;
        this.$cats.each(function(i, el) {
            $(el).removeClass('checked');
        });
        self.chkCatIDs = [];
        self.chkCardsCount = 0;
        this.$counters[0].innerHTML = self.chkCatIDs.length + ' Categories';
        this.$counters[1].innerHTML = self.chkCardsCount + ' Cards';
        this.$footer.animate({ bottom: '-80px' }, {
            duration: 500,
            queue: false
        });
        this.$pageContent.animate({ bottom: '0px' }, {
            duration: 500,
            queue: false,
            always: function() {
                self.refreshScroll();
                self.lengthLog = 0;
            }
        });
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

    prepareCards: function () {
        var self = this,
            catIDs = self.chkCatIDs,
            cardsByCat = RAD.models.cards.cardsByCat,
            testCards = [],
            options,
            i;

        if (catIDs.length === 0) {
            //display alert toast
            this.publish('navigation.toast.show', {
                content: 'view.alert',
                extras: {
                    msg: 'Categories not chosen'
                }
            });
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
            for (i = 0; i < catIDs.length; i++) {
                _(cardsByCat[catIDs[i]]).each(function (card) {
                    testCards.push(card.toJSON());
                });
            }

            options = {
                content: 'view.test',
                container_id: '.sub-content',
                animation: 'slide-in',
                extras: {
                    cards: testCards
                },
                callback: function () {
                    self.application.flags.set('testRunning', true);
                    self.publish('view.main_screen.doneBtnShow');
                    self.application.saveProgress();
                }
            };
            self.publish('navigation.show', options);
            self.publish('view.main_screen.changeTitle', {title: 'Testing'});
        }
    }
}));