'use strict';

var RAD = require('RAD');

var template = RAD.template(require('./MainLayout.ejs'), {
    components: {
        TopBar: require('./TopBar/TopBar'),
        Clients: require('./Clients/Clients')
    }
});

var MainPage = RAD.Base.View.extend({
    template: template,
    initialize: function() {
        this.subscribe('route:change', this.setActivePage, this);
    },
    setActivePage: function (pageData) {
        this.props.set(pageData);
    }
});

module.exports = new MainPage();