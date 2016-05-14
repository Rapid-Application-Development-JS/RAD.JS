"use strict";
var RAD = require('RAD');

var App = RAD.Module.extend({
    onInitialize: function () {
        this.start();
    },
    start: function () {
        this.publish('navigation.show', {
            container: '#screen',
            content: require('views/main'),
            animation: 'fade'
        });
    }
});

var app = new App();

module.exports = app;

