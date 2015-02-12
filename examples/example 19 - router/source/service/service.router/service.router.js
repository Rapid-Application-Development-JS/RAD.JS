// register Backbone.Router as RAD service for including .publish & .subscribe functionality & application object
RAD.service("service.router", Backbone.Router.extend({

    routes: {
        ":screen/:action": "extrasRoute",
        "*action": "extrasRoute" // Backbone will try match the route above first && index.html#...
    },

    initialize: function () {
        // for direction detect
        this.actions = [];
        this.lastAction = null;

        // Start Backbone history a necessary step for bookmarkable URL's
        Backbone.history.start();

        // subscribe to radID channel
        this.subscribe(this.radID, this.onReceiveMsg, this);
    },

    onReceiveMsg: function (channel, data) {
        var parts = channel.split('.');

        switch (parts[parts.length - 1]) {
            case 'clear':
                this.actions = [];
                this.lastAction = null;
                window.location.hash = '';
                break;
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
        if (!this.application.isLogined()) {
            window.location.hash = this.application.NOT_AUTHORIZED_ACTION;
        } else if (!action) {
            window.location.hash = this.application.DEFAULT_ACTION;
        }

        // do something
        action = this.checkLogin(action);
        options = {
            content: 'screen.' + action,
            container_id: '#screen',
            animation: this.isItForwardDirection(action) ? (action === this.application.NOT_AUTHORIZED_ACTION ? 'none' : 'slide' ) : 'slide-out'
        };
        if (extras) {
            options.extras = extras;
        }
        this.publish('navigation.show', options);
    },

    checkLogin: function (action) {
        return this.application.isLogined() ? action : this.application.NOT_AUTHORIZED_ACTION;
    },

    isItForwardDirection: function (action) {
        var forward = true;

        if (action && this.actions[this.actions.length - 1] === action) {
            this.actions.pop();
            forward = false;
        } else if (this.lastAction) {
            this.actions.push(this.lastAction);
        }
        this.lastAction = action;

        return forward;
    }
}));