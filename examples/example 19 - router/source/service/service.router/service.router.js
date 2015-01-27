// register Backbone.Router as RAD service for including .publish & .subscribe functionality & application object
RAD.service("service.router", Backbone.Router.extend({

    routes: {
        ":screen/:action": "extrasRoute",
        "*action": "defaultRoute" // Backbone will try match the route above first && index.html#...
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

    defaultRoute: function (action) {
        action = this.checkLogin(action);
        this.publish('navigation.show', {
            content: 'screen.' + action,
            container_id: '#screen'
        });
    },

    extrasRoute: function (action, extras) {
        action = this.checkLogin(action);
        this.publish('navigation.show', {
            content: 'screen.' + action,
            container_id: '#screen',
            extras: extras
        });
    },

    checkLogin: function (action) {
        return this.application.isLogined() ? action : 'login';
    }

}));