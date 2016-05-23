"use strict";
var RAD = require('RAD');

var app = {
    start: function () {
        RAD.publish('navigation.show', {
            container: '#screen',
            content: require('views/root'),
            animation: 'fade'
        });
    }
};

module.exports = app;