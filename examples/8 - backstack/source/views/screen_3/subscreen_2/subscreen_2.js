RAD.view("view.subscreen_2", RAD.Blanks.View.extend({
    url: 'source/views/screen_3/subscreen_2/subscreen_2.html',
    events: {
        'tap button': 'gotoPage'
    },
    gotoPage: function (e) {
        "use strict";
        var options = {
            container_id: '.subscreen',
            content: "view.subscreen_3",
            backstack: true
        };
        this.publish('navigation.show', options);
    }
}));