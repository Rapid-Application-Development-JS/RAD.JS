'use strict';
var Backbone = require('backbone');
var RAD = require('RAD');

var AppRouter = Backbone.Router.extend({
    routes: {
        '': 'home',
        '*pages': 'notFound'
    },

    initialize: function () {
        Backbone.history.start();
    },

    home: function () {
        this.publishRoute('home');
    },

    notFound: function () {
        this.publishRoute('404');
    },

    publishRoute: function (pageName) {
        this.storeActivePage(pageName);
        RAD.publish('route:change', this.activePage());
    },

    storeActivePage: function (name) {
        this.pageName = name;
        this.fragment = Backbone.history.fragment;
    },

    activePage: function () {
        return {
            pageName: this.pageName,
            urlFragment: this.fragment
        };
    }
});

var router = new AppRouter();

module.exports = router;