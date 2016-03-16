'use strict';

var RAD = require('RAD');

var TopBar = RAD.Base.View.extend({
    className: 'panel panel--header',
    template: RAD.template( require('./TopBar.ejs'), {
        components: {
            SearchForm: require('../SearchForm/SearchForm')
        }
    })
});

module.exports = new TopBar();