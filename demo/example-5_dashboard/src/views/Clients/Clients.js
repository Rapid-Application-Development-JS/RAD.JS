'use strict';

var RAD = require('RAD');
var clients = require('../../models/Clients/Clients');

// Compile template with predefined list of components.
var template = RAD.template( require('./Clients.ejs'), {
    components: {
        Stage: require('./ClientsStage/Stage')
    }
});

var Clients = RAD.Base.View.extend({
    template: template,

    events: {
        'submit': 'preventSubmit',
        'submit #add-client': 'addClient'
    },

    initialize: function() {
        clients.fetch();
        this.bindRender(clients, 'add remove');
    },

    preventSubmit: function(e) {
        e.preventDefault();
    },

    addClient: function(e) {
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