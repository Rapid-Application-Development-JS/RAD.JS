RAD.views.ContentFirstWidget = RAD.Blanks.View.extend({
    url: 'source/views/inner/third_widget/content-first/content-first.html',
    events: {
        'tap .cube-container': "changePosition"
    },
    index: 0,
    classes: ["show-front", "show-back", "show-right", "show-left", "show-top", "show-bottom"],
    changePosition: function () {
        var $box = this.$('#cube');
        $box.removeClass(this.classes[this.index]);
        this.index += 1;
        if (this.index >= this.classes.length) {
            this.index = 0;
        }
        $box.addClass(this.classes[this.index]);
    }
});
