'use strict';
var RAD = require('RAD');
var clients = require('../../models/Clients/Clients');

var Clients = RAD.View.extend({
    template: require('./Clients.ejs'),

    events: {
        'submit': 'preventSubmit',
        'submit #add-client': 'addClient'
    },

    initialize: function () {
        clients.fetch();
        this.bindRender(clients, 'add remove');
    },

    preventSubmit: function (e) {
        e.preventDefault();
    },

    addClient: function (e) {
        var input = e.target.elements['clientName'];
        var name = input.value;
        input.value = '';

        clients.create({name: name}, {
            validate: true,
            wait: true
        });
    }
});

module.exports = Clients;