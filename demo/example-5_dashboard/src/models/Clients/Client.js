'use strict';
var Backbone = require('backbone');

var Client = Backbone.Model.extend({
    defaults: {
        name: '',
        position: '',
        company: '',
        salary: 0,
        stage: 1,
        date: Date.now()
    },
    validate: function (attrs) {
        if (!attrs.name.trim()) {
            return 'Client name cannot be blank';
        }
    }
});

module.exports = Client;