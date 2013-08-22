RAD.view("view.widget1", RAD.Blanks.View.extend({
    url: 'source/views/widget1/widget1.html',
    className: "rad-bar rad-success",
    events: {
        'keyup input': 'changeVal'
    },
    changeVal: function(e) {
        "use strict";
        var publish = this.publish,
            data = e.currentTarget.value;

        publish("service.my_service", data);
    }
}));