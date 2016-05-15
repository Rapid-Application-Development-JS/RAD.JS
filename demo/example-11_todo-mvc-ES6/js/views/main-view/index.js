"use strict";
import  _ from 'underscore';
import {View} from 'RAD';
import todoList from 'models/todos';

class TodoList extends View {
    template = require('./main-tpl.ejs');

    events = {
        'submit': 'preventSubmit',
        'submit .form-todo': 'addTodo',
        'change .toggle-all': 'toggleAll',
        'click .clear-completed': 'clearCompleted'
    };

    initialize() {
        todoList.fetch({reset: true});
        this.bindRender(todoList, 'add remove reset change:completed');
        this.subscribe('filter', this.filter, this);
    }
    
    preventSubmit(e) {
        e.preventDefault();
    }

    filter(value) {
        this.props.set('filter', value);
    }

    getTemplateData() {
        return {
            todos: _(todoList.filterBy(this.props.get('filter'))),
            remaining: todoList.active().length,
            length: todoList.length
        }
    }

    addTodo() {
        todoList.create(
            {title: this.refs.inputField.value.trim()},
            {wait: true}
        );

        this.refs.inputField.value = '';
    }

    toggleAll(e) {
        todoList.each(function (todo) {
            todo.save(
                {completed: e.target.checked},
                {silent: true}
            );
        });
        this.render();
    }

    clearCompleted() {
        _.invoke(todoList.completed(), 'destroy');
        this.render();
    }
}

module.exports = TodoList;