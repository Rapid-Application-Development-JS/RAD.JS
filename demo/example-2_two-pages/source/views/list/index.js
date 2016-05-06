"use strict";

var RAD = require('RAD');

var ListView  = RAD.View.extend({
    template: RAD.template(require('./tpl.ejs')),
    //className: 'native-scroll'
});

module.exports = ListView;
