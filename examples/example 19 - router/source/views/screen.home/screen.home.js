RAD.view("screen.home", RAD.Blanks.View.extend({

    url: 'source/views/screen.home/screen.home.html',

    events: {
        'click button': 'action'
    },

    action: function (e) {
        var target = e.currentTarget,
            action = target.getAttribute('data-action'),
            params = target.previousElementSibling.value;

        this.application.action(action, params);
    }
}));