RAD.view("view.inner_screen_3", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/screen_3/inner_screen_3/inner_screen_3.html',
    events: {
        'tap .go-to': 'next'
    },
    next: function (e) {
        "use strict";
        var options = {
            container_id: '#second-tab',
            content: "view.inner_screen_4",
            backstack: true
        };
        this.publish('navigation.show', options);
    }
}));