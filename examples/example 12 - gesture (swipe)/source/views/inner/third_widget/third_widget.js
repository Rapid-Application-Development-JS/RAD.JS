RAD.view("view.inner_third_widget", RAD.Blanks.View.extend({
    url: 'source/views/inner/third_widget/third_widget.html',
    events: {
        'pointerdown .pointer-wrap': 'tapDown',
        'pointermove .pointer-wrap': 'tapMove',
        'pointerup .pointer-wrap': 'tapUp'
    },
    tapDown: function (e) {
        "use strict";
        var $pointer, X, Y, event;

        if (!this.pointer) {
            this.pointer = this.$('#pointer');
        }
        $pointer = this.pointer;

        event = (e.speedX !== undefined) ? e : e.originalEvent;
        X = event.clientX - e.currentTarget.getBoundingClientRect().left;
        Y = event.clientY - e.currentTarget.getBoundingClientRect().top;

        $pointer.css({left: X, top: Y, display: 'block'});
    },
    tapMove: function (e) {
        "use strict";
        var event = (e.speedX !== undefined) ? e : e.originalEvent,
            X = event.clientX - e.currentTarget.getBoundingClientRect().left,
            Y = event.clientY - e.currentTarget.getBoundingClientRect().top;

        this.pointer.css({left: X, top: Y});
    },
    tapUp: function () {
        "use strict";
        this.pointer.css('display', 'none');
    }
}));