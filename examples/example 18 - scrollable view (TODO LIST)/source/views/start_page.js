RAD.view("view.start_page", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/start_page.html',
    events: {
        'submit': 'addToList',
        'change .todo-list': 'updateList',
        'click .remove-icon': 'removeFromList'
    },
    onInitialize: function () {
        "use strict";
        this.model = RAD.model('list');
    },
    addToList: function(e) {
        "use strict";
        var field = this.el.querySelector('.task-name'),
            taskName = field.value;

        e.preventDefault();

        if (taskName) {
            this.model.unshift({name: taskName, done: false});
            field.value = '';
        }
    },
    updateList: function (e) {
        "use strict";
        var checkbox = e.target,
            holder = checkbox.parentNode.parentNode,
            isDone = checkbox.checked,
            index = checkbox.value;

        if (holder.classList) {
            holder.classList.toggle('done');
        }
        this.model.at(index).set({done: isDone}, {silent: true, reset: true});
    },
    removeFromList: function(e) {
        "use strict";
        var index = e.currentTarget.getAttribute('data-index');

        this.model.remove(this.model.at(index));
    }
}));