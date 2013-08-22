RAD.views.ContentThirdWidget = RAD.Blanks.ScrollableView.extend({
    url: 'source/views/inner/third_widget/content-third/content-third.html',
    events: {
        'tap .add-task': 'addTask',
        'tap .clickable': 'doneTask'

    },
    onInitialize: function () {
        "use strict";
        this.model = new (Backbone.Collection.extend({}))();
    },
    addTask: function () {
        "use strict";
        var task = this.$('#new_task').get(0).value || "Empty task";

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
});