"use strict";

var RAD = require('RAD');

var HomeView  = RAD.View.extend({
    template: RAD.template(require('./tpl.ejs')),
    className: 'native-scroll'
});

module.exports = new HomeView;
