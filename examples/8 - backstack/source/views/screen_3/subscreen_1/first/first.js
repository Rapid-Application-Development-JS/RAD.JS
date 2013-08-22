RAD.view("view.screen_3_first", RAD.Blanks.View.extend({
    url: 'source/views/screen_3/subscreen_1/first/first.html',
    events: {
        'tap button': 'gotoPage'
    },
    gotoPage: function (e) {
        "use strict";
        var options = {
            container_id: '.subscreen',
            content: "view.subscreen_2",
            backstack: true
        };
        this.publish('navigation.show', options);
    }
}));