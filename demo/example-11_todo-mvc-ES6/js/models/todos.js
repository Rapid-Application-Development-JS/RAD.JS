'use strict';
var RAD = require('RAD');
var _ = require('underscore');
var {Model, Collection} = require('Backbone');

class TodoItem extends Model {
    defaults() {
        return {
            title: '',
            completed: false
        };
    }

    toggle() {
        this.save({
            completed: !this.get('completed')
        });
    }

    validate(attributes) {
        if (!attributes.title) {
            return 'title cannot be blank';
        }
    }

    isVisible(filterState) {

        if (filterState === 'completed') {
            return this.get('completed');
        }

        if (filterState === 'active') {
            return !this.get('completed');
        }

        return true;
    }
}

class TodoItems extends Collection {
    model = TodoItem;

    localStorage = new Backbone.LocalStorage('todos-backbone');

    comparator = 'order';

    filterBy(param) {
        // In case when param value is active or completed
        if (typeof this[param] == 'function') {
            return this[param]();
        }

        return this.models;
    }

    completed() {
        return this.where({completed: true});
    }

    active() {
        return this.where({completed: false});
    }

    nextOrder() {
        return this.length ? this.last().get('order') + 1 : 1;
    }

    create(todo, options) {
        todo = _.extend({}, todo, {order: this.nextOrder()});
        options = _.extend({}, options, {validate: true});

        return Backbone.Collection.prototype.create.call(this, todo, options);
    }
}

module.exports = new TodoItems();