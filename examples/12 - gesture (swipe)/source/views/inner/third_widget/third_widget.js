RAD.view("view.inner_third_widget", RAD.Blanks.View.extend({
    url: 'source/views/inner/third_widget/third_widget.html',
    events: {
        'tapdown #drag-listener': 'tapDown',
        'tapmove #drag-listener': 'tapMove',
        'tapup #drag-listener': 'tapUp'
    },
    tapDown: function (e) {
        "use strict";
        var $pointer, X, Y;

        if (!this.pointer) {
            this.pointer = this.$('#pointer');
        }
        $pointer = this.pointer;

        X = e.originalEvent.tapdown.clientX - e.currentTarget.getBoundingClientRect().left;
        Y = e.originalEvent.tapdown.clientY - e.currentTarget.getBoundingClientRect().top;
        $pointer.css({left: X, top: Y, display: 'block'});
    },
    tapMove: function (e) {
        "use strict";
        var X = e.originalEvent.tapmove.clientX - e.currentTarget.getBoundingClientRect().left,
            Y = e.originalEvent.tapmove.clientY - e.currentTarget.getBoundingClientRect().top;

        this.pointer.css({left: X, top: Y});
    },
    tapUp: function () {
        "use strict";
        this.pointer.css('display', 'none');
    }
}));