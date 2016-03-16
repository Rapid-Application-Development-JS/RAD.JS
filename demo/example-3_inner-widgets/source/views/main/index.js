"use strict";

var RAD = require('RAD');


var HomeView = RAD.Base.View.extend({
    template: RAD.template( require('./tpl.ejs'), {
        components: {
            // Dummy component
            TopBar: RAD.template( require('../header/tpl.ejs') ),

            // Smart components
            FirstTab: require('../inner/tab-first'),
            SecondTab: require('../inner/tab-second')
        }
    }),

    events: {
        'click .switch-to': 'switchTab'
    },

    activeTabName: 'first',

    getTemplateData: function() {
        return {
            tabName: this.activeTabName
        };
    },

    switchTab: function (e) {
        var tabName = e.currentTarget.getAttribute('data-tab-name');

        if (this.activeTabName !== tabName) {
            this.activeTabName = tabName;
            this.render();
        }
    }
});

module.exports = new HomeView();