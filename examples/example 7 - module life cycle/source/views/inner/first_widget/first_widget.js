RAD.view("view.inner_first_widget", RAD.Blanks.ScrollableView.extend({
    url: 'source/views/inner/first_widget/first_widget.html',
    onEndRender: function() {
        "use strict";
        var self = this;

        // Refresh iScroll after all images was loaded
        this.$images = this.$el.find('img');
        this.$images.on('load.images', function() {
            self.refreshScroll();
        });
    },
    onEndDetach: function() {
        "use strict";
        this.$images.off('load.images');
    }
}));