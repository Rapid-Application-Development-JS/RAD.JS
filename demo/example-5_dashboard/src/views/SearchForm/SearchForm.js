'use strict';
var $ = require('jquery');
require('jquery-ui/autocomplete');

var _ = require('underscore');
var RAD = require('RAD');
var clients = require('../../models/Clients/Clients');

var Form = RAD.View.extend({
    tagName: 'form',
    template: require('./SearchForm.ejs'),

    className: function () {
        return this.props.get('class');
    },

    onAttach: function () {
        this.initAutoComplete();
    },
    onDetach: function () {
        this.$searchField.autocomplete('destroy');
    },
    initAutoComplete: function () {
        this.$searchField = this.$('#search');
        this.$searchField.autocomplete({
            source: this.search.bind(this)
        });

        // Custom item template with highlighting matches
        this.$searchField.data("uiAutocomplete")._renderItem = function (ul, item) {
            var matcher = new RegExp("(" + this.term + ")", "gi");
            var template = "<span class='highlight'>$1</span>";
            var label = '<a>' + item.label.replace(matcher, template) + '</a>';

            return $("<li>").append(label).appendTo(ul);
        };
    },

    search: function (request, response) {
        response(clients.filterByName(request.term).map(function (client) {
            return {
                value: client.get('name')
            };
        }));
    }


});


module.exports = Form;