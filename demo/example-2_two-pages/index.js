'use strict';

var RAD = require('RAD');

RAD.getRandomColor = function () {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

RAD.publish('navigation.show', {
    container: '#screen',
    content: require('views/main')
});



