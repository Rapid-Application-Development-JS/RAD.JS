RAD.view("view.toast", RAD.Blanks.View.extend({
    url: 'source/views/toast/toast.html',
    className: 'popup-view',
    attributes: {
        'data-role': 'popup-view'
    },
    onInitialize: function () {
        'use strict';
        var Model = Backbone.Model.extend();

        this.model = new Model();
    },
    onNewExtras: function (extras) {
        'use strict';
        var title = (extras && extras.title) ? extras.title : 'Message';
        this.model.set({msg: extras.msg, title: title, type: extras.type, gravity: extras.gravity});
    }
}));