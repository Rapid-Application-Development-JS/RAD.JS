"use strict";

var RAD = require('RAD');

var TabView = RAD.View.extend({
    template: require('./tpl.ejs')
});

module.exports = TabView;