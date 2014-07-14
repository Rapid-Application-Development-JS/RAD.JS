RAD.view(["view.receiver1", "view.receiver2"], RAD.Blanks.View.extend({
    url: 'source/views/receiver/receiver.html',
    onInitialize: function () {
        "use strict";
        this.subscribe("my_hub", this.onMyMsg, this);
    },
    onMyMsg: function (channel, data) {
        "use strict";
        this.$el.find('.msg').html(data);
    }
}));