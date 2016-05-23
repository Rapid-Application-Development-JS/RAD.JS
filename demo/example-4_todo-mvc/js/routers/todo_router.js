'use strict';
var Backbone = require('Backbone');
var RAD = require('RAD');

var TodoRouter = Backbone.Router.extend({
    routes: {
        '*filter': 'filterItems'
    },

    initialize: function () {
        Backbone.history.start();
    },

    filterItems: function (param) {
        this.filterVal = param;
        RAD.publish('filter', param);
    },

    getValue: function () {
        return this.filterVal;
    }
});

var router = new TodoRouter();

module.exports = router;