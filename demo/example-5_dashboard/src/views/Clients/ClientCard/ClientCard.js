'use strict';

var RAD = require('RAD');

var Card = RAD.Base.View.extend({
    template: RAD.template( require('./ClientCard.ejs') ),
    className: 'tile'
});

module.exports = Card;