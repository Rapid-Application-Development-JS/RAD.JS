'use strict';
require('./helpers');

var RAD = require('RAD');
var router = require('./router');

RAD.publish('navigation:show', {
    container: '#container',
    content: require('./views/MainPage'),
    options: router.activePage()
});