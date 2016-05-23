"use strict";
var RAD = require('RAD');

var DetailsView = RAD.View.extend({
    template: require('./tpl.ejs')
});

module.exports = DetailsView;