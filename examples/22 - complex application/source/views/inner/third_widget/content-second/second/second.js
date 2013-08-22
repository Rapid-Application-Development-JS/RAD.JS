RAD.views.SecondWidget = RAD.Blanks.ScrollableView.extend({
    url: 'source/views/inner/third_widget/content-second/second/second.html',
    events: {
        'tap .goto-next': 'openNext',
        'tap .show-popup': 'openPopup'
    },
    openNext: function () {
        "use strict";
        this.publish('navigation.show', {
            container_id: '.content-second',
            content: 'view.first',
            animation: 'slide-out'
        });
    },
    openPopup: function () {
        "use strict";

        var options,
            target = this.$('.popup-anchor').get(0);

        options = {
            content: "view.popup",

            target: target,
            width: 200,
            height: 200,

            extras: {
                onCloseDestroy: true,
                outSideClose: true,
                msg: target.value || "Empty"
            }
        };

        this.publish('navigation.popup.show', options);
    }
});