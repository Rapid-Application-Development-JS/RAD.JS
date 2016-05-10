"use strict";

var RAD = require('RAD');

var ListView  = RAD.View.extend({
    template: RAD.template(require('./tpl.ejs')),
    initialize: function() {
        this.collection = require('../../collections/animations');
    }
});

module.exports = ListView;
