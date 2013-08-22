RAD.view("view.subscreen_1", RAD.Blanks.View.extend({
    url: 'source/views/screen_3/subscreen_1/subscreen_1.html',
    children: [
        {
            container_id: '.content',
            content: "view.screen_3_first"
        }
    ],
    events: {
        'tap .button-go-to': 'open',
        'tap .button-logout': 'logout'
    },
    open: function (e) {
        "use strict";
        var $target = $(e.currentTarget),
            $lastTarget = this.$lastTarget || this.$('.rad-footer.rad-tab-bar .active'),
            options = {
                container_id: '.content'
            };

        $lastTarget.removeClass('active');
        this.$lastTarget = $target;
        $target.addClass('active');

        options.content = $target.data('target');
        options.animation = $target.data('animation');
        this.publish('navigation.show', options);
    },
    logout: function (e) {
        "use strict";
        this.application.logout($(e.currentTarget).data('animation') || 'none');
    }

}));