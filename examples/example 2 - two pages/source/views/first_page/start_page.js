RAD.view("view.start_page", RAD.Blanks.View.extend({
    url: 'source/views/first_page/start_page.html',
    events: {
        'tap .go-to': 'open'
    },
    open: function () {
        "use strict";
        var options = {
                container_id: '#screen',
                content: "view.second_page"
            },
            animation;

        animation = this.$('input[type=radio]:checked').attr('id');
        if (animation && animation.length > 0) {
            options.animation = animation;
        }
        options.extras = {animation: animation};

        this.publish('navigation.show', options);
    }
}));