RAD.view("view.widget1", RAD.Blanks.View.extend({
    url: 'source/views/widget1/widget1.html',
    events: {
        'keyup input': 'changeVal'
    },
    changeVal: function(e) {
        "use strict";
        var data = e.currentTarget.value;

        this.publish("service.my_service", data);
        this.publish("service.my_service2", data);
    }
}));