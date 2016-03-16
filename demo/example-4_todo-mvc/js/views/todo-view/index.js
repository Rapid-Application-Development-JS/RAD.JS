"use strict";

var $ = require('jQuery');
var _ = require('underscore');
var RAD = require('RAD');


var ESC_KEY = 27;
var ENTER_KEY = 13;

var TodoView = RAD.Base.View.extend({
    template: RAD.template( require('./todo-tpl.ejs')),

    events: {
        'click .toggle': 'toggle',
        'dblclick .todo-label': 'editMode',
        'blur .edit': 'saveAndClose',
        'keyup .edit': 'handleInput',
        'click .destroy': 'removeTodo'
    },

    className: function () {
        var className = this.model.get('completed') ? 'completed' : '';
        var state = this.props.get('editing') ? 'editing' : '';

        return className + ' ' + state;
    },

    initialize: function() {
        this.bindRender(this.model, 'change:title');
    },

    toggle: function() {
        this.model.toggle();
    },

    editMode: function() {
        this.props.set('editing', true);
        this.refs.title.focus();
    },

    closeEditMode: function() {
        this.props.set('editing', false);
        this.refs.title.blur();
    },

    handleInput: function(event) {
        if (event.keyCode == ENTER_KEY) {
            this.saveAndClose();

        } else if (event.keyCode == ESC_KEY) {
            this.revertAndClose();
        }
    },

    revertAndClose: function() {
        this.refs.title.value = this.model.get('title');
        this.closeEditMode();
    },

    saveAndClose: function() {
        var title = this.refs.title.value.trim();

        if (!this.props.get('editing')) {
            return;
        }

        this.closeEditMode();

        if (title) {
            this.model.save({title: title});
        } else {
            this.model.destroy();
        }
    },
    removeTodo: function() {
        this.model.destroy();
    }
});

module.exports = TodoView;
