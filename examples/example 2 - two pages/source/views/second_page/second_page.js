RAD.view("view.second_page", RAD.Blanks.View.extend({
    url: 'source/views/second_page/second_page.html',
    events: {
        'tap #back': 'goBack'
    },
    goBack: function () {
        "use strict";
        var options = {
                container_id: '#screen',
                content: "view.start_page"
            },
            animation;

        animation = this.extras.animation;
        if (animation && animation.length > 0) {
            if (animation !== 'none') {
                options.animation = animation + '-out';
            } else {
                options.animation = animation;
            }
        }

        this.publish('navigation.show', options);
    }
}));