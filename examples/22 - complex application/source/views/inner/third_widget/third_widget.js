RAD.views.InnerThirdWidget = RAD.Blanks.View.extend({
    url: 'source/views/inner/third_widget/third_widget.html',
    children: [
        {
            container_id: '.th-content',
            content: "view.content_first_widget"
        }
    ],
    events: {
        'tap .button-go-to': 'open'
    },
    open: function (e) {
        "use strict";
        var $target = $(e.currentTarget),
            $lastTarget = this.$lastTarget || this.$('.rad-footer.rad-tab-bar .active'),
            options = {
                container_id: '.th-content'
            },
            lastIndex = $lastTarget.data('index'),
            newIndex = $target.data('index');

        $lastTarget.removeClass('active');
        this.$lastTarget = $target;
        $target.addClass('active');

        options.content = $target.data('target');
        options.animation = $target.data('animation') + ((lastIndex > newIndex) ? '-out' : '-in');
        this.publish('navigation.show', options);
    }

});