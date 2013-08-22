RAD.view("view.widget2", RAD.Blanks.View.extend({
    url: 'source/views/widget2/widget2.html',
    onReceiveMsg: function(channel, data) {
        "use strict";
        console.log(data);
        this.$('#msg').html(data);
    }
}));