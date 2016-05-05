"use strict";
var RAD = require('RAD');

var DetailsView = RAD.View.extend({
    template: RAD.template(require('./tpl.ejs'))
});

module.exports = new DetailsView;