RAD.view("screen.second", RAD.Blanks.View.extend({

    url: 'source/views/screen.second/screen.second.html',

    model: new (Backbone.Model.extend({}))(),

    onNewExtras: function (extras) {
        this.model.set({string: extras});
    }

}));