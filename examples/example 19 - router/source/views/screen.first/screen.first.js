RAD.view("screen.first", RAD.Blanks.View.extend({

    url: 'source/views/screen.first/screen.first.html',

    model: new (Backbone.Model.extend({}))(),

    onNewExtras: function (extras) {
        this.model.set({string: extras});
    }

}));