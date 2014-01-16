RAD.view('view.alert', RAD.Blanks.Toast.extend({

    url: 'source/views/alert/alert.html',
    className: 'topcoat-overlay-bg',

    model: new (Backbone.Model.extend({
        defaults: {
            "msg": ''
        }
    })),

    onNewExtras: function (data) {
        "use strict";
        this.model.set(data);
    }
}));