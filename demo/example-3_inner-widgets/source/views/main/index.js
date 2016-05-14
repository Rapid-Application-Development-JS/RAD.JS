"use strict";

var RAD = require('RAD');


var HomeView = RAD.View.extend({
    template: require('./tpl.ejs'),

    events: {
        'click .switch-to': 'switchTab'
    },

    activeTabName: 'first',

    getTemplateData: function () {
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