'use strict';
var Backbone = require('backbone');
var LocalStorage = require('../LocalStorage');

var Clients = Backbone.Collection.extend({
    model: require('./Client'),
    localStorage: new LocalStorage('Clients'),

    filterByName: function (name) {
        if (!name) {
            return [];
        }

        name = name.toLowerCase();

        return this.filter(function (client) {
            var clientName = client.get('name').toLowerCase();

            return clientName.indexOf(name) > -1;
        });
    }
});
var clients = new Clients();

module.exports = clients;