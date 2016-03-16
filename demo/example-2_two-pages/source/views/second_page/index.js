"use strict";
var RAD = require('RAD');

var DetailsView = RAD.Blanks.View.extend({
    template: RAD.template(require('./tpl.ejs')),
    events: {
        'click #back': 'goBack'
    },
    goBack: function () {
        this.publish('navigation.back', {
            container: '#screen',
            content: require('views/first_page')
        });
    }
});

module.exports = new DetailsView();