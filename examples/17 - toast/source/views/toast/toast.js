RAD.view("view.toast", RAD.Blanks.Toast.extend({
    url: 'source/views/toast/toast.html',

    onInitialize: function () {
        'use strict';
        var Model = Backbone.Model.extend();

        this.model = new Model();
    },
    onNewExtras: function (extras) {
        'use strict';
        var title = (extras && extras.title) ? extras.title : 'Message';
        this.model.set({msg: extras.msg, title: title, type: extras.type});

        if (extras && extras.showTime) {
            try {
                this.showTime = parseInt(extras.showTime, 10);
            } catch (e) {
            }
        }
    }
}));