RAD.view("view.menu", RAD.Blanks.View.extend({

    className: 'menu',

    url: 'source/views/menu/menu.html',

    events: {
        'tap li': 'openView'
    },

    onInitialize: function () {
        this.model = this.application.flags;
    },

    openView: function (e){
        "use strict";

        var newViewID = $(e.currentTarget).data('view-id'),
            newViewName = $(e.currentTarget).text(),
            options = {
                container_id: '.sub-content',
                content: newViewID,
                animation: 'fade',
                animationTimeout: 500,
                extras: {}
            },
            headerData = {
                title: newViewName
            };

        this.$('.list-item').each(function(i, el) {
            if ($(el).hasClass('picked')) {
                $(el).removeClass('picked');
            }
        });

        if (newViewID === 'view.test') {
            headerData.title = "Testing";
        }
        if (newViewID === 'view.cards') {
            headerData.title = "choose cards";
        }

        $(e.currentTarget).addClass('picked');

        this.publish('navigation.show', options);
        this.publish('view.main_screen.close');
        this.publish('view.main_screen.changeTitle', headerData);
    }
}));
