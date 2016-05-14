"use strict";
import {View} from 'RAD';

class TodoView extends View {

    static ESC_KEY = 27;
    static ENTER_KEY = 13;

    template = require('./todo-tpl.ejs');

    events = {
        'click .toggle': 'toggle',
        'dblclick .todo-label': 'editMode',
        'blur .edit': 'saveAndClose',
        'keyup .edit': 'handleInput',
        'click .destroy': 'removeTodo'
    };

    className() {
        var className = this.model.get('completed') ? 'completed' : '';
        var state = this.props.get('editing') ? 'editing' : '';

        return className + ' ' + state;
    }

    initialize() {
        this.bindRender(this.model, 'change:title');
    }

    toggle() {
        this.model.toggle();
    }

    editMode() {
        this.field = this.refs.edit;
        this.props.set('editing', true);
        this.field.focus();
    }

    closeEditMode() {
        this.props.set('editing', false);
        this.field.blur();
    }

    handleInput(event) {
        if (event.keyCode == TodoView.ENTER_KEY) {
            this.saveAndClose();

        } else if (event.keyCode == TodoView.ESC_KEY) {
            this.revertAndClose();
        }
    }

    revertAndClose() {
        this.field.value = this.model.get('title');
        this.closeEditMode();
    }

    saveAndClose() {
        var title = this.field.value.trim();

        if (!this.props.get('editing')) {
            return;
        }

        this.closeEditMode();

        if (title) {
            this.model.save({title: title});
        } else {
            this.model.destroy();
        }
    }

    removeTodo() {
        this.model.destroy();
    }
}

module.exports = TodoView;