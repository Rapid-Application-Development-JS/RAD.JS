"use strict";

var RAD = require('RAD');

var ListView = RAD.View.extend({
    template: require('./tpl.ejs'),
    initialize: function () {
        this.collection = require('../../collections/animations');
    },
    onRender: function () {
        // Used to show how animation works during continuous render
        if (!this.interval) {
            this.interval = window.setInterval(this.render.bind(this), 500);
        }
    },
    onDetach: function () {
        window.clearInterval(this.interval);
    }
});

module.exports = ListView;
