RAD.view("view.top", RAD.Blanks.View.extend({
    className: 'block',
    url: 'source/views/top/top.html',
    events: {
        'tap .go-back': 'goBack'
    },
    goBack: function () {
        "use strict";
        this.publish('router.back', null);
    }
}));