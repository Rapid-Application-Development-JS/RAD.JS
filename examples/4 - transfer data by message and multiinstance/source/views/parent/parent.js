RAD.view("view.parent", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/parent/parent.html',
    children: [
        {
            container_id: '#widget1',
            content: "view.widget1"
        },
        {
            container_id: '#widget2',
            content: "view.widget2"
        },
        {
            container_id: '#receiver1',
            content: "view.receiver1"
        },
        {
            container_id: '#receiver2',
            content: "view.receiver2"
        }
    ],
    onInitialize: function () {
        "use strict";
        this.subscribe("my_hub", this.refreshScroll, this);
    }
}));