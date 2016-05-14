"use strict";
var RAD = require('RAD');

var RootView = RAD.View.extend({
    charData: 10,

    template: require('./tpl.ejs'),

    events: {
        'input .slider': 'changeData'
    },

    initialize: function () {
        this.props.set('charData', 10);
    },

    changeData: function (e) {
        this.props.set('charData', parseInt(e.target.value));
    }
});

module.exports = new RootView();