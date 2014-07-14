RAD.view("view.widget1", RAD.Blanks.View.extend({
    url: 'source/views/widget1/widget1.html',
    events: {
        'keyup input': 'changeVal'
    },
    changeVal: function(e) {
        "use strict";
        var publish = this.publish,
            data = e.currentTarget.value;

        publish("view.widget2", data);
        publish("my_hub", data);
    }
}));