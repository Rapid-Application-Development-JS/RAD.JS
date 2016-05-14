'use strict';
var RAD = require('RAD');

var TopBar = RAD.View.extend({
    className: 'panel panel--header',
    template: require('./TopBar.ejs')
});

module.exports = new TopBar();