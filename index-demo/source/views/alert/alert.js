RAD.view('view.alert', RAD.Blanks.Toast.extend({

    url: 'source/views/alert/alert.html',

    model: new (Backbone.Model.extend({
        defaults: {
            "msg": ''
        }
    })),

    onNewExtras: function (data) {
        this.model.set(data);
    }
}));