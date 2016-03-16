"use strict";

var RAD = require('RAD');

var HomeView  = RAD.Base.View.extend({
    template: RAD.template(require('./tpl.ejs')),
    className: 'native-scroll',
    events: {
        'click [data-animation]': 'navigate'
    },
    navigate: function() {
        this.publish('navigation.show', {
            container: '#screen',
            content: require('views/second_page')
        });
    }
});

module.exports = new HomeView();
