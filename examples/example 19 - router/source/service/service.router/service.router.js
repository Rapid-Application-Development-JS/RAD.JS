// register Backbone.Router as RAD service for including .publish & .subscribe functionality & application object
RAD.service("service.router", Backbone.Router.extend({

    routes: {
        ":screen/:action": "extrasRoute",
        "*action": "extrasRoute" // Backbone will try match the route above first && index.html#...
    },

    initialize: function () {
        // Start Backbone history a necessary step for bookmarkable URL's
        Backbone.history.start();

        // subscribe to radID channel
        this.subscribe(this.radID, this.onReceiveMsg, this);
    },

    onReceiveMsg: function (channel, data) {
        var parts = channel.split('.');

        switch (parts[parts.length - 1]) {
            case 'go':
                window.location.hash = (data.parameter) ? data.action + '/' + data.parameter : data.action;
                break;
            case 'back':
                window.history.back();
                break;
        }
    },

    extrasRoute: function (action, extras) {
        var options;
        if (!this.application.isLogined() || !action) {
            window.location.hash = 'login';
        } else if (!action) {
            window.location.hash = 'home';
        }

        options = {
            content: 'screen.' + this.checkLogin(action),
            container_id: '#screen'
        };

        if (extras) {
            options.extras = extras;
        }
        
        this.publish('navigation.show', options);
    },

    checkLogin: function (action) {
        return this.application.isLogined() ? action : 'login';
    }

}));