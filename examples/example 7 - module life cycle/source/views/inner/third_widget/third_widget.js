RAD.view("view.inner_third_widget", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/inner/third_widget/third_widget.html',
    onInitialize: function () {
        "use strict";
        this.subscribe("life_cycle", this.onLifeCycleMsg, this);
    },
    onLifeCycleMsg: function (channel, data) {
        "use strict";
        this.$('.console-log').append('<div>' + data.where + ':' + data.what + '</div>');

        this.refreshScroll();
        this.mScroll.scrollTo(0, this.mScroll.wrapperH - this.mScroll.scrollerH, 0);
    }
}));