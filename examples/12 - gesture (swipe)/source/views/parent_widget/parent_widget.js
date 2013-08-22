RAD.view("view.parent_widget", RAD.Blanks.View.extend({
    url: 'source/views/parent_widget/parent_widget.html',
    swipe_content: ["view.inner_first_widget", "view.inner_second_widget", "view.inner_third_widget"],
    swipe_current: 0,
    events: {
        'swipe .swipe-content': 'swipe'
    },
    children: [
        {
            container_id: '.swipe-content',
            content: "view.inner_first_widget",
            animation: "none"
        }
    ],
    swipe: function (e) {
        "use strict";
        var self = this,
            direction = e.originalEvent.swipe.direction,
            animation,
            permission = false,
            options;
        if ((direction === "left" || direction === "right") && e.originalEvent.swipe.speed > 0.2) {
            if (direction === "left" && (self.swipe_current < self.swipe_content.length - 1)) {
                animation = "slide-in";
                self.swipe_current += 1;
                permission = true;
            } else if (direction === "right" && self.swipe_current > 0) {
                animation = "slide-out";
                self.swipe_current -= 1;
                permission = true;
            }

            if (permission) {
                options = {
                    content: self.swipe_content[self.swipe_current],
                    container_id: '.swipe-content',
                    animation: animation
                };
                self.publish('navigation.show', options);
            }
        }
    }
}));