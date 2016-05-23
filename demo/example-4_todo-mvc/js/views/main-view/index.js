"use strict";
var $ = require('jQuery');
var _ = require('underscore');

var RAD = require('RAD');
var Backbone = require('Backbone');
var todoList = require('models/todos');

window.todoList = todoList;

var TodoList = RAD.View.extend({
    template: require('./main-tpl.ejs'),

    events: {
        'submit': 'preventSubmit',
        'submit .form-todo': 'addTodo',
        'change .toggle-all': 'toggleAll',
        'click .clear-completed': 'clearCompleted'
    },

    initialize: function () {
        todoList.fetch({reset: true});
        this.bindRender(todoList, 'add remove reset change:completed');
        this.subscribe('filter', this.filter, this);
    },

    preventSubmit: function (e) {
        e.preventDefault();
    },

    filter: function (value) {
        this.props.set('filter', value);
    },

    getTemplateData: function () {
        return {
            todos: _(todoList.filterBy(this.props.get('filter'))),
            remaining: todoList.active().length,
            length: todoList.length
        }
    },

    addTodo: function (e) {
        e.preventDefault();
        todoList.create({
            id: _.uniqueId('todo-'),
            title: this.refs.inputField.value.trim()
        });

        this.refs.inputField.value = '';
    },

    toggleAll: function (e) {
        todoList.each(function (todo) {
            todo.save(
                {completed: e.target.checked},
                {silent: true}
            );
        });
        this.render();
    },

    clearCompleted: function () {
        _.invoke(todoList.completed(), 'destroy');
        this.render();
    }

});

module.exports = TodoList;