RAD.view("view.tab_inner_1", RAD.Blanks.View.extend({
    url: 'source/views/screen_3/subscreen_1/second/tab_inner_1/tab_inner_1.html',
    events: {
        'tap button': 'gotoPage'
    },
    gotoPage: function (e) {
        "use strict";
        var options = {
            container_id: '#inner-tabs',
            content: "view.tab_inner_2",
            backstack: true
        };
        this.publish('navigation.show', options);
    }
}));