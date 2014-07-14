RAD.view("view.inner_screen_1", RAD.Blanks.View.extend({
    url: 'source/views/screen_3/inner_screen_1/inner_screen_1.html',
    events: {
        'tap button': 'gotoPage'
    },
    gotoPage: function (e) {
        "use strict";
        this.publish('navigation.show', {
            container_id: '#first-tab',
            content: "view.inner_screen_2",
            backstack: true
        });
    }
}));