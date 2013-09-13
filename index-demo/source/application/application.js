RAD.namespace('utils.Query', function (context) {
    var query = this,
        stack = [];

    function next(previousResult) {
        var fn = stack.shift();
        if (fn && typeof fn === 'function') {
            fn.apply(context, [previousResult, next]);
        }
    }

    query.push = function (fn) {
        stack.push(fn);
    };

    query.run = function () {
        next(null);
    };

    return query;
});

RAD.application(function (core) {
    'use strict';

    var app = this;

    function showMainScreen(previousResult, nextFn) {
        core.publish('navigation.show', {
            container_id: '#screen',
            content: "view.main_screen",
            animation: 'fade',
            callback: nextFn
        });
    }

    function showLoadingScreen(previousResult, nextFn) {
        core.publish('navigation.show', {
            container_id: '#screen',
            content: "view.loading",
            animation: 'none',
            callback: nextFn
        });
    }

    function loadCards(previousResult, nextFn) {
        core.publish('service.json_loader.load', {
            filename: 'cards.json',
            callback: nextFn
        });
    }

    function resetCards(previousResult, nextFn) {
        RAD.models.cards.resetCards(previousResult);
        nextFn(null);
    }

    function loadCategories(previousResult, nextFn) {
        core.publish('service.json_loader.load', {
            filename: 'categories.json',
            callback: nextFn
        });
    }

    function resetCategories(previousResult, nextFn) {
        RAD.models.categories.resetCat(previousResult);
        nextFn(null);
    }

    app.start = function () {
        var query = new RAD.utils.Query(this);

        query.push(showLoadingScreen);
        query.push(loadCards);
        query.push(resetCards);
        query.push(loadCategories);
        query.push(resetCategories);
        query.push(showMainScreen);
        query.run();
    };

    app.flags = RAD.model('flags', Backbone.Model.extend({
        defaults: {
            "testRunning": false,
            "progressSaved": false
        }
    }));

    app.saveProgress = function () {
        core.publish('service.storage.save', {objectID: 'quizCards', object: RAD.models.cards});
        this.flags.set('progressSaved', true);
    };

    app.loadProgress = function () {
        core.publish('service.storage.load', {
            objectID: 'quizCards',
            callback: function (loadedObj) {
                if (!!loadedObj) {
                    RAD.models.cards.merge(loadedObj);
                    RAD.models.cards.groupCardsByCats();
                }
            }
        });
    };

    app.clearProgress = function () {
        RAD.models.cards.each(function (card) {
            card.set('status', 'unanswered');
        });

        core.publish('service.storage.remove', {objectID: "quizCards"});
        core.publish('view.stats.refresh');
        this.flags.set('progressSaved', false);
    };

    return app;

}, true);

