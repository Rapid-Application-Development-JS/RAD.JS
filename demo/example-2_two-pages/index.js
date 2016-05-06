'use strict';

var RAD  = require('RAD');

RAD.publish('navigation.show', {
    container: '#screen',
    content: require('views/main')
});



