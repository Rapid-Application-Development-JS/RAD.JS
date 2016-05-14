'use strict';
import {publish} from 'RAD';
import todoFilter from './routers/todo_router';

/*
 * You should load helpers
 * */
import helpers from './components/NavItem';
import TodoList from './views/main-view/';


// publish first component
publish('navigation.show', {
    container: '#todo-app',
    content: TodoList,
    options: {
        filter: todoFilter.getValue()
    }
});