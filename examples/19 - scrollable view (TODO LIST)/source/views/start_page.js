RAD.view("view.start_page", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/start_page.html',
    events: {
        'tap .add-task': 'addTask',
        'tap .clickable': 'doneTask'
    },
    onInitialize: function () {
        "use strict";
        this.model = RAD.models.data;
    },
    addTask: function () {
        "use strict";
        var task = this.$('#new_task').get(0).value;

        this.model.add({task: task, done: false});
    },
    doneTask: function (e) {
        "use strict";
        var $target = $(e.currentTarget),
            index = $target.data('index'),
            done = this.model.at(index).get('done');

        $target.toggleClass('done');
        $target.find('input').prop('checked', !done);

        this.model.at(index).set({done: !done}, {silent: true, reset: true});
    }
}));