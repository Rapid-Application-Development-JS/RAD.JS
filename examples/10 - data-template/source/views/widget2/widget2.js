RAD.view("view.widget2", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/widget2/widget2.html',
    className: "rad-bar",
    onInitialize: function () {
        "use strict";
        this.model = RAD.models.message;
    }
}));