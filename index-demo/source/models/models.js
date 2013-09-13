/** Classes */

// Card Model
RAD.model('Card', Backbone.Model.extend({
    defaults: {
        "status": "unanswered",   // know, unsure, dontknow, unanswered
        "answer": "",
        "answerImg": "",
        "answerImgThumb": "",
        "catRef": 0,
        "id": 0,
        "question": "",
        "questionImg": "",
        "questionImgThumb": ""
    }
}), false);

// Category Model
RAD.model('Category', Backbone.Model.extend({
    defaults: {
        "id": 0,
        "name": ""
    }
}), false);

// Collection of Categories
RAD.model('CatsCollection', Backbone.Collection.extend({
    model: RAD.models.Category,
    comparator: function (cat) {
        return cat.get("id");
    },

    merge: function (data) {
        var self = this;
        _.each(data, function (mod) {
            if (self.get(mod.id)) {
                self.get(mod.id).set(mod);
            }
        });
    },
    resetCat: function (object) {
        this.reset(object);
        this.resetCatNames();
    },
    resetCatNames: function () {
        var self = this;
        self.catNames = {};
        _.each(self.models, function (element) {
            self.catNames[element.get('id')] = element.get('name');
        });
    }
}), false);

// Collection of Cards
RAD.model('CardsCollection', Backbone.Collection.extend({
    model: RAD.models.Card,
    comparator: function (card) {
        return card.get("id");
    },
    merge: function (data) {
        var self = this;
        _.each(data, function (mod) {
            if (self.get(mod.id)) {
                // if question was changed, mean that all other attributes need to be updated and status reseted to "unanswered"
                if (self.get(mod.id).get('question') === mod.question) {
                    // partially merging from local storage: only status of question
                    self.get(mod.id).set("status", mod.status);
                }
            }
        });
    },
    resetCards: function (object) {
        this.reset(object);
        this.groupCardsByCats();
    },
    groupCardsByCats: function () {
        var self = this;
        self.cardsByCat = self.groupBy('catRef');
    }
}), false);

// Collection of Tests
RAD.model('TestCollection', Backbone.Collection.extend({
    model: RAD.models.Card
}), false);

//Collection of Stats
RAD.model('StatsCollection', Backbone.Collection.extend({
    model: Backbone.Model.extend({
        defaults: {
            "name": "",
            "id": 0,
            "know": 0,
            "unsure": 0,
            "dontKnow": 0,
            "unanswered": 0,
            "cardsCount": 0
        }
    }),
    initialize: function () {

    },
    refreshStats: function () {
        var self = this,
            cardsByCat = RAD.models.cards.cardsByCat,
            cardsColl = RAD.models.cards,
            catsColl = RAD.models.categories,
            stats = [];
        stats.push({
            "id": -1,
            "name": "All categories",
            "know": cardsColl.filter(function (card) {
                return card.get('status') === 'know'
            }).length / cardsColl.length,
            "unsure": cardsColl.filter(function (card) {
                return card.get('status') === 'unsure'
            }).length / cardsColl.length,
            "dontKnow": cardsColl.filter(function (card) {
                return card.get('status') === 'dontknow'
            }).length / cardsColl.length,
            "unanswered": cardsColl.filter(function (card) {
                return card.get('status') === 'unanswered'
            }).length / cardsColl.length,
            "cardsCount": cardsColl.length
        });
        catsColl.each(function (cat) {
            if (!!cardsByCat[cat.get('id')]) {
                stats.push({
                    "id": cat.get('id'),
                    "name": cat.get('name'),
                    "cardsCount": cardsByCat[cat.get('id')].length,
                    "know": (cardsByCat[cat.get('id')].filter(function (card) {
                        return card.get('status') === 'know'
                    }).length / cardsByCat[cat.get('id')].length),
                    "unsure": (cardsByCat[cat.get('id')].filter(function (card) {
                        return card.get('status') === 'unsure'
                    }).length / cardsByCat[cat.get('id')].length),
                    "dontKnow": (cardsByCat[cat.get('id')].filter(function (card) {
                        return card.get('status') === 'dontknow'
                    }).length / cardsByCat[cat.get('id')].length),
                    "unanswered": (cardsByCat[cat.get('id')].filter(function (card) {
                        return card.get('status') === 'unanswered'
                    }).length / cardsByCat[cat.get('id')].length)
                });
            }
        });
        self.reset(stats);
    }
}), false);

/** Instances */

// Colors for chart
RAD.model('colors', {
    unanswered: ['rgb(0,199,255)', 'rgb(0,145,186)'],
    know: ['rgb(0,255,4)', 'rgb(12,181,0)'],
    unsure: ['rgb(255,204,0)', 'rgb(178,142,0)'],
    dontKnow: ['rgb(255,84,0)', 'rgb(183,3,0)']
});

RAD.model('categories', RAD.models.CatsCollection);

RAD.model('cards', RAD.models.CardsCollection);

RAD.model('test', RAD.models.TestCollection);

RAD.model('filter', RAD.models.TestCollection);