RAD.view("view.parent_widget", RAD.Blanks.View.extend({
    url: 'source/views/parent_widget/parent_widget.html',
    swipe_content: ["view.inner_first_widget", "view.inner_second_widget", "view.inner_third_widget"],
    swipe_current: 0,
    events: {
        'fling #swipe-content': 'swipe'
    },
    children: [
        {
            container_id: '#swipe-content',
            content: "view.inner_first_widget",
            animation: "none"
        }
    ],
    swipe: function (e) {
        "use strict";
        var self = this,
            event,
            horizontalFling,
            animation,
            permission = false,
            options;

        event = (e.speedX !== undefined) ? e : e.originalEvent;
        horizontalFling = Math.abs(event.speedX) > Math.abs(event.speedY);

        if (horizontalFling) {
            if ((event.speedX < 0) && (self.swipe_current < self.swipe_content.length - 1)) {
                animation = "slide-in";
                self.swipe_current += 1;
                permission = true;
            } else if ((event.speedX > 0) && self.swipe_current > 0) {
                animation = "slide-out";
                self.swipe_current -= 1;
                permission = true;
            }

            if (permission) {
                options = {
                    content: self.swipe_content[self.swipe_current],
                    container_id: '#swipe-content',
                    animation: animation
                };
                self.publish('navigation.show', options);
            }
        }
    }
}));