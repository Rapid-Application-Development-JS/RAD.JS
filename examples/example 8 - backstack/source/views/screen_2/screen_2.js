RAD.view("view.screen_2", RAD.Blanks.View.extend({
    url: 'source/views/screen_2/screen_2.html',
    events: {
        'tap li': 'goNext'
    },
    goNext: function (e) {
        "use strict";
        var options = {
            container_id: '#screen',
            content: "view.screen_3",
            backstack: true
        };
        this.publish('navigation.show', options);
    }
}));