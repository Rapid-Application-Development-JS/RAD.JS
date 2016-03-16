"use strict";
var RAD = require('RAD');

require('../components/slider');

var App = RAD.Blanks.Module.extend({
    onInitialize: function() {
        this.start();
    },
    start: function() {
        this.publish('navigation.show', {
            container: '#screen',
            content: require('views/root'),
            animation: 'fade'
        });
    }
});

var app = new App();

module.exports = app;