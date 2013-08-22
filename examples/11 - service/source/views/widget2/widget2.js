RAD.view("view.widget2", RAD.Blanks.View.extend({
    url: 'source/views/widget2/widget2.html',
    className: "rad-bar",
    onReceiveMsg: function(channel, data) {
        "use strict";
        this.$('#msg').html(data);
    }
}));