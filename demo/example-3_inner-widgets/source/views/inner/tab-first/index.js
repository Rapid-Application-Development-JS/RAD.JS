"use strict";

var RAD = require('RAD');

var TabView = RAD.View.extend({
    template: require('./tpl.ejs'),

    onAttach: function () {
        console.log('attach', this.getID());
    },
    onDetach: function () {
        console.log('detach', this.getID());
    }
});

module.exports = TabView;