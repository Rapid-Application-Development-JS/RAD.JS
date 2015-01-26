RAD.service("service.router", RAD.Blanks.Service.extend({

    hashes: {
        login: {
            content: 'screen.login',
            container_id: '#screen'
        },

        home: {
            content: 'screen.home',
            container_id: '#screen'
        },

        first: {
            content: 'screen.first',
            container_id: '#screen'
        },

        second: {
            content: 'screen.second',
            container_id: '#screen'
        }
    },

    onInitialize: function () {
        var Router = Backbone.Router.extend({
            routes: {
                "*actions": "defaultRoute" // Backbone will try match the route above first && index.html#...
            },
            service: this
        });

        // instantiate router
        this.router = new Router();

        // apply route listeners;
        this.router.on('route:defaultRoute', this.checkLogin);

        // Start Backbone history a necessary step for bookmarkable URL's
        Backbone.history.start();
    },

    onReceiveMsg: function (channel, data) {
        var parts = channel.split('.'), url;
        switch (parts[parts.length - 1]) {
            case 'actions':
                if (this.application.isLogined()) {
                    if (this.lastAction) {
                        url = 'index.html' + this.lastAction;
                        console.log(url);
                        this.lastAction = null;
                    } else {
                        url = 'index.html#' + data.actions;
                        if (data.parameter) {
                            url += this.setURLParameters(data.parameter);
                        }
                    }
                } else {
                    url = 'index.html#login';
                }
                window.location.href = url;
                break;
        }
    },

    checkLogin: function (action) {
        var service = this.service, parameters, options;

        if (service.application.isLogined()) {
            // extract options for navigation
            options = Object.create(service.hashes[action]);

            // get url parameters
            parameters = service.getURLParameters();
            if (parameters && Object.keys(parameters).length > 0) {
                // add extras
                options.extras = parameters;
            }

            // show screen
            service.publish('navigation.show', options);
        } else {
            if (window.location.hash !== '#login') {
                service.lastAction = window.location.hash;
                window.location.href = 'index.html#login';
            }
            service.publish('navigation.show', {
                content: 'screen.login',
                container_id: '#screen'
            });
        }
    },

    getURLParameters: function () {
        var queryObj = {}, query = window.location.href.split("?"), vars = query[query.length - 1].split("&"),
            i, pair, arr;

        for (i = 0; i < vars.length && query.length > 1; i++) {
            pair = vars[i].split("=");
            // If first entry with this name
            if (typeof queryObj[pair[0]] === "undefined") {
                queryObj[pair[0]] = pair[1];
                // If second entry with this name
            } else if (typeof queryObj[pair[0]] === "string") {
                arr = [queryObj[pair[0]], pair[1]];
                queryObj[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                queryObj[pair[0]].push(pair[1]);
            }
        }
        return queryObj;
    },

    setURLParameters: function (queryObj) {
        var queryStr = null, key, tmpStr;

        for (key in queryObj) {
            if (queryObj.hasOwnProperty(key)) {
                if (queryObj[key] !== undefined || queryObj[key] !== null) {
                    tmpStr = key + '=' + queryObj[key];
                } else {
                    tmpStr = key;
                }

                if (queryStr) {
                    queryStr += '&' + tmpStr;
                } else {
                    queryStr = tmpStr;
                }
            }
        }

        return '?' + queryStr;
    }

}));