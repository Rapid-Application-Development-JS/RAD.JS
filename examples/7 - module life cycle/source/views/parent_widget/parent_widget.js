RAD.view("view.parent_widget", RAD.Blanks.View.extend({
    url: 'source/views/parent_widget/parent_widget.html',
    children: [
        {
            container_id: '.content',
            content: "view.inner_first_widget"
        },
        {
            container_id: '.top',
            content: "view.inner_third_widget"
        }
    ],
    events: {
        'tap .button-go-to': 'open',
        'tap .button-delete': 'deleteView'
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
    deleteView: function (e) {
        "use strict";
        this.publish('view.inner_second_widget', {
            deleteView: true,
            animation: $(e.currentTarget).data('animation')
        });
    }
}));