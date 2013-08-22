RAD.views.menu = RAD.Blanks.View.extend({
    className: 'menu',
    url: 'source/views/menu/menu.html',
    events: {
        'tap li': 'openView'
    },
    openView: function (e){
        "use strict";

        var newView = $(e.currentTarget).data('view'),
            options = {
                container_id: '.sub-content',
                content: newView,
                animation: 'fade'
            };

        this.publish('navigation.show', options);
        this.publish('view.parent_widget.close', null);
    }
});
