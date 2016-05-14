'use strict';
var RAD = require('RAD');
var _ = require('underscore');
var Backbone = require('Backbone');

var TodoItem = Backbone.Model.extend({

    defaults: {
        title: '',
        completed: false
    },

    toggle: function () {
        this.save({
            completed: !this.get('completed')
        });
    },

    validate: function (attributes) {
        if (!attributes.title) {
            return 'title cannot be blank';
        }
    },

    isVisible: function (filterState) {

        if (filterState === 'completed') {
            return this.get('completed');
        }

        if (filterState === 'active') {
            return !this.get('completed');
        }

        return true;
    }
});

var TodoItems = Backbone.Collection.extend({

    model: TodoItem,
    localStorage: new Backbone.LocalStorage('todos-backbone'),
    comparator: 'order',

    filterBy: function (param) {
        // In case when param value is active or completed
        if (typeof this[param] == 'function') {
            return this[param]();
        }

        return this.models;
    },

    completed: function () {
        return this.where({completed: true});
    },

    active: function () {
        return this.where({completed: false});
    },

    nextOrder: function () {
        return this.length ? this.last().get('order') + 1 : 1;
    },

    create: function (todo, options) {
        todo = _.extend({}, todo, {order: this.nextOrder()});
        options = _.extend({}, options, {validate: true});

        return Backbone.Collection.prototype.create.call(this, todo, options);
    }

});

module.exports = new TodoItems();