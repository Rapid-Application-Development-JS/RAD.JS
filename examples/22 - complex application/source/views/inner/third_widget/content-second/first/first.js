RAD.views.FirstWidget = RAD.Blanks.ScrollableView.extend({
    url: 'source/views/inner/third_widget/content-second/first/first.html',
    events: {
        'tap .goto-next': 'openNext'
    },
    openNext: function () {
        "use strict";
        this.publish('navigation.show', {
            container_id: '.content-second',
            content: 'view.second',
            animation: 'slide-in'
        });
    }
});