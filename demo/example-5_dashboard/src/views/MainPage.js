'use strict';
var RAD = require('RAD');

var MainPage = RAD.View.extend({
    template: require('./MainLayout.ejs'),
    initialize: function () {
        this.subscribe('route:change', this.setActivePage, this);
    },
    setActivePage: function (pageData) {
        this.props.set(pageData);
    }
});

module.exports = new MainPage();