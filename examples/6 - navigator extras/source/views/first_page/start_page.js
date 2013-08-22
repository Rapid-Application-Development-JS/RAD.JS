RAD.view("view.start_page", RAD.Blanks.View.extend({
    url: 'source/views/first_page/start_page.html',
    events: {
        'tap ul li': 'open'
    },
    open: function (e) {
        "use strict";
        var options = {
                container_id: '#screen',
                content: "view.second_page"
            };

        options.extras = {data: e.currentTarget.innerHTML};

        this.publish('navigation.show', options);
    }
}));