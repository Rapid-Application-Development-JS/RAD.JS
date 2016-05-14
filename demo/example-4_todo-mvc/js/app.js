'use strict';

var RAD = require('RAD');
var Backbone = require('Backbone');
var todoFilter = require('./routers/todo_router');

require('./components/NavItem');

RAD.publish('navigation.show', {
    container: '#todo-app',
    content: require('./views/main-view/'),
    options: {
        filter: todoFilter.getValue()
    }
});

