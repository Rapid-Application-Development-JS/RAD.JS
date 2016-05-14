'use strict';
var RAD = require('RAD');

var Card = RAD.View.extend({
    template: require('./ClientCard.ejs'),
    className: 'tile'
});

module.exports = Card;